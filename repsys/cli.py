import logging
from typing import Dict

import click
import coloredlogs
from click import Context

from repsys.config import read_config
from repsys.core import train_models, evaluate_dataset, start_server, split_dataset, evaluate_models
from repsys.dataset import Dataset
from repsys.helpers import *
from repsys.loaders import load_packages
from repsys.model import Model

logger = logging.getLogger(__name__)


def setup_logging(level):
    coloredlogs.install(
        level=level,
        use_chroot=False,
        fmt="%(asctime)s %(levelname)-8s %(name)s  - %(message)s",
    )


def models_callback(ctx, param, value):
    return load_packages(value, Model)


def config_callback(ctx, param, value):
    return read_config(value)


def dataset_callback(ctx, param, value):
    instances = load_packages(value, Dataset)
    default_name = list(instances.keys())[0]
    if len(instances) > 1:
        dataset_name = click.prompt('Multiple datasets detected, please specify',
                                    type=click.Choice(list(instances.keys())), default=default_name)
        return instances.get(dataset_name)
    return instances.get(default_name)


def dataset_pkg_option(func):
    @click.option("--dataset-pkg", "dataset", callback=dataset_callback, default="dataset", show_default=True)
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)

    return wrapper


def models_pkg_option(func):
    @click.option("--models-pkg", "models", callback=models_callback, default="models", show_default=True)
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)

    return wrapper


@click.group()
@click.option('--debug/--no-debug', default=False)
@click.option('-c', '--config', callback=config_callback, default='repsys.ini', type=click.Path(exists=True))
@click.pass_context
def repsys_group(ctx, debug, config):
    ctx.ensure_object(dict)
    ctx.obj['CONFIG'] = config

    if debug:
        setup_logging(logging.DEBUG)
    else:
        setup_logging(logging.INFO)

    create_checkpoints_dir()


@repsys_group.command(name='server')
@models_pkg_option
@dataset_pkg_option
@click.pass_context
def server_start_cmd(ctx: Context, models: Dict[str, Model], dataset: Dataset):
    """Start server."""
    start_server(ctx.obj['CONFIG'], models, dataset)


@click.group(name='model')
def models_group():
    """Model commands."""
    """Implemented models commands."""
    pass


@click.group(name='dataset')
def dataset_group():
    """Dataset commands."""
    pass


repsys_group.add_command(dataset_group)
repsys_group.add_command(models_group)


# MODELS GROUP
@models_group.command(name='eval')
@models_pkg_option
@dataset_pkg_option
@click.pass_context
@click.option("-s", "--split-type", default="validation", type=click.Choice(["test", "validation"]), show_default=True)
@click.option("-m", "--model-name")
def models_eval_cmd(ctx: Context, models: Dict[str, Model], dataset: Dataset, split_type: str, model_name: str):
    evaluate_models(ctx.obj['CONFIG'], models, dataset, split_type, model_name)


@models_group.command(name='train')
@dataset_pkg_option
@models_pkg_option
@click.pass_context
@click.option("-m", "--model-name")
def models_train_cmd(ctx: Context, models: Dict[str, Model], dataset: Dataset, model_name: str):
    train_models(ctx.obj['CONFIG'], models, dataset, model_name)


# DATASET GROUP
@dataset_group.command(name='split')
@dataset_pkg_option
@click.pass_context
def dataset_split_cmd(ctx: Context, dataset: Dataset):
    split_dataset(ctx.obj['CONFIG'], dataset)


@dataset_group.command(name='eval')
@dataset_pkg_option
@click.pass_context
@click.option("--method", default="pymde", type=click.Choice(["pymde", "tsne", "custom"]), show_default=True)
def dataset_eval_cmd(ctx: Context, dataset: Dataset, method: str):
    evaluate_dataset(ctx.obj['CONFIG'], dataset, method)
