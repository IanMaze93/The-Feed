const config = {
  _id: "rs0",
  members: [
    {
      _id: 0,
      host: "mongo:27017",
    },
  ],
};

try {
  rs.status();
  print("Replica set already initialized.");
} catch (error) {
  if (error.code === 94 || error.codeName === "NotYetInitialized") {
    rs.initiate(config);

    while (!db.hello().isWritablePrimary) {
        sleep(1000);
    }

    print("Replica set initialized.");
  } else {
    throw error;
  }
}