import time

from pymongo import MongoClient
from pymongo.errors import OperationFailure, PyMongoError

from src.tools.logging import getLogger

logger = getLogger()

MONGO_HOST = "mongo:27017"
REPLICA_SET = "rs0"


def initialize_replica_set():
    client = MongoClient(
        f"mongodb://{MONGO_HOST}/?directConnection=true",
        serverSelectionTimeoutMS=5000,
    )

    try:
        client.admin.command("ping")

        try:
            client.admin.command("replSetGetStatus")
            logger.info("MongoDB replica set already initialized.")

        except OperationFailure as exc:
            if exc.code != 94:
                raise

            logger.info("Initializing MongoDB replica set...")

            client.admin.command(
                {
                    "replSetInitiate": {
                        "_id": REPLICA_SET,
                        "members": [
                            {
                                "_id": 0,
                                "host": MONGO_HOST,
                            }
                        ],
                    }
                }
            )

        # Wait for MongoDB to become PRIMARY.
        for attempt in range(30):
            try:
                status = client.admin.command("replSetGetStatus")

                if status.get("myState") == 1:
                    logger.info("MongoDB replica set is PRIMARY.")
                    return

            except PyMongoError:
                pass

            logger.info("Waiting for MongoDB PRIMARY (%s/30)", attempt + 1)
            time.sleep(1)

        raise RuntimeError("MongoDB replica set failed to elect a PRIMARY.")

    finally:
        client.close()
