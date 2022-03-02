import configparser
import os

import repsys.constants as const
from repsys.errors import InvalidConfigError


class DatasetConfig:
    def __init__(self, test_holdout_prop: float, train_split_prop: float, min_user_interacts: int,
                 min_item_interacts: int):
        self.test_holdout_prop = test_holdout_prop
        self.train_split_prop = train_split_prop
        self.min_user_interacts = min_user_interacts
        self.min_item_interacts = min_item_interacts


class Config:
    def __init__(self, checkpoints_dir: str, seed: int, server_port: int, dataset_config: DatasetConfig):
        self.dataset = dataset_config
        self.checkpoints_dir = checkpoints_dir
        self.seed = seed
        self.server_port = server_port


def validate_dataset_config(config: DatasetConfig):
    if config.train_split_prop <= 0 or config.train_split_prop >= 1:
        raise InvalidConfigError('The train split proportion must be between 0 and 1')

    if config.test_holdout_prop <= 0 or config.test_holdout_prop >= 1:
        raise InvalidConfigError('The test holdout proportion must be between 0 and 1')

    if config.min_user_interacts < 0:
        raise InvalidConfigError('Minimum user interactions can be negative')

    if config.min_item_interacts < 0:
        raise InvalidConfigError('Minimum item interactions can be negative')


def read_config(config_path: str):
    config = configparser.ConfigParser()

    if os.path.isfile(config_path):
        with open(config_path, 'r') as f:
            config.read_file(f)

    dataset_config = DatasetConfig(
        config.getfloat('dataset', 'TEST_HOLDOUT_PROP', fallback=const.DEFAULT_TEST_HOLDOUT_PROP),
        config.getfloat('dataset', 'TRAIN_SPLIT_PROP', fallback=const.DEFAULT_TRAIN_SPLIT_PROP),
        config.getint('dataset', 'MIN_USER_INTERACTS', fallback=const.DEFAULT_MIN_USER_INTERACTS),
        config.getint('dataset', 'MIN_ITEM_INTERACTS', fallback=const.DEFAULT_MIN_ITEM_INTERACTS),
    )

    validate_dataset_config(dataset_config)

    return Config(
        config.get('general', 'CHECKPOINTS_DIR', fallback=const.DEFAULT_CHECKPOINTS_DIR),
        config.getint('general', 'SEED', fallback=const.DEFAULT_SEED),
        config.get('server', 'PORT', fallback=const.DEFAULT_SERVER_PORT),
        dataset_config
    )
