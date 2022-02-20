import functools
import logging
from abc import ABC, abstractmethod
from typing import Text, Dict, Optional, Type

import numpy as np

from repsys.dataset import Dataset
from repsys.web import WebParam

logger = logging.getLogger(__name__)


def enforce_dataset(func):
    @functools.wraps(func)
    def wrapper(self, *args, **kwargs):
        if not hasattr(self, "dataset") or self.dataset is None:
            raise Exception("The model must be updated with a dataset.")
        return func(self, *args, **kwargs)

    return wrapper


class Model(ABC):
    def __init__(self):
        self.dataset: Optional[Dataset] = None

    @abstractmethod
    def name(self) -> Text:
        """Get a unique name of the model."""
        pass

    @abstractmethod
    @enforce_dataset
    def fit(self, training: bool = False) -> None:
        """Train the model using the training interactions.
        If the model is already trained, load it from a file."""
        pass

    @abstractmethod
    def predict(self, X, **kwargs):
        """Make a prediction from the input interactions and
        return a matrix including ratings for each item. The second
        argument includes a dictionary of values for each parameter
        set in the web application."""
        pass

    def web_params(self) -> Dict[str, Type[WebParam]]:
        """Return a list of parameters that will be displayed
        in the web application allowing a user to pass additional
        arguments to the prediction method."""
        return {}

    def update_dataset(self, dataset: Dataset) -> None:
        """Update the model with an instance of the dataset."""
        if not isinstance(dataset, Dataset):
            raise Exception(
                "The data must be an instance of the dataset class."
            )

        self.dataset = dataset

    @enforce_dataset
    def predict_top_n(self, input_data, n=20, **kwargs):
        """Make a prediction, but return directly a list of top ids."""
        prediction = self.predict(input_data, **kwargs)
        indexes = (-prediction).argsort()[:, :n]
        vfn = np.vectorize(self.dataset.item_index_to_id)

        return vfn(indexes)

    def to_dict(self):
        """Serialize details about the model to the dictionary."""
        return {"params": {key: param.to_dict() for key, param in self.web_params().items()}}

    def __str__(self) -> Text:
        return f"Model '{self.name()}'"
