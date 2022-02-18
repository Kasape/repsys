import logging
import os
from typing import List, Dict

import numpy as np
from pandas import DataFrame
from sanic import Sanic
from sanic.exceptions import InvalidUsage, NotFound
from sanic.response import json, file

from repsys.dataset import Dataset
from repsys.model import Model

logger = logging.getLogger(__name__)


def serialize_items(items: DataFrame):
    serialized_items = items.copy()
    serialized_items["id"] = serialized_items.index

    return serialized_items.to_dict("records")


def create_app(models: Dict[str, Model], dataset: Dataset):
    app = Sanic(__name__)

    static_folder = os.path.join(os.path.dirname(__file__), "../frontend/build")
    app.static("/", static_folder)

    @app.route("/")
    async def index(request):
        return await file(f"{static_folder}/index.html")

    @app.route("/api/models")
    def get_config(request):
        return json({
            model.name(): model.to_dict() for model in models.values()
        })

    @app.route("/api/dataset")
    def get_config(request):
        return json({
            "items": int(dataset.n_items),
            "columns": dataset.items.columns.tolist(),
        })

    @app.route("/api/users")
    def get_users(request):
        split = request.args.get("split")

        if not split:
            raise InvalidUsage("The dataset's split must be specified.")

        return json(dataset.vad_users)

    @app.route("/api/items")
    def get_items(request):
        query_str = request.args.get("query")

        if not query_str or len(query_str) == 0:
            raise InvalidUsage("The query string must be specified.")

        title_col = dataset.item_title_col()
        items = dataset.filter_items(title_col, query_str)
        data = json(serialize_items(items))

        return data

    @app.route("/api/interactions")
    def get_interactions(request):
        user_id: str = request.args.get("user")

        if user_id is None or not user_id.isdigit():
            raise InvalidUsage("A valid user ID must be specified.")

        user_id = int(user_id)

        if user_id not in dataset.vad_users:
            raise NotFound(f"User '{user_id}' was not found.")

        items = dataset.get_interacted_items(user_id)
        data = json(serialize_items(items))

        return data

    @app.route("/api/predict", methods=["POST"])
    def post_prediction(request):
        user_id = request.json.get("user")
        interactions = request.json.get("interactions")
        limit = request.json.get("limit", 20)
        params = request.json.get("params", {})
        model_name = request.json.get("model")

        if (user_id is None and interactions is None) or (
            user_id is not None and interactions is not None
        ):
            raise InvalidUsage(
                "Either the user or his interactions must be specified."
            )

        if not model_name:
            raise InvalidUsage("Model name must be specified.")

        model = [m for m in models if m.name() == model_name][0]

        if not model:
            raise NotFound(f"Model '{model_name}' was not found.")

        default_params = {p.name: p.default for p in model.web_params()}
        cleaned_params = {
            k: v for k, v in params.items() if k in default_params
        }
        predict_params = {**default_params, **cleaned_params}

        if user_id is not None:
            try:
                user_id = int(user_id)
                X = dataset.get_user_history(user_id)
            except Exception:
                raise NotFound(f"User '{user_id}' was not found.")
        else:
            interactions = np.array(interactions)
            X = dataset.input_from_interactions(interactions)

        items = model.predict_top_n(X, limit, **predict_params)
        data = json(serialize_items(items))

        return data

    @app.listener("after_server_stop")
    def on_shutdown(current_app, loop):
        logger.info("Server has been shut down.")

    return app


def run_server(port: int, models: Dict[str, Model], dataset: Dataset) -> None:
    app = create_app(models, dataset)
    app.run(host="localhost", port=port, debug=False, access_log=False)
