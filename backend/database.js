const sqlite = require("sqlite")

exports.dbPromise = sqlite.open("./database.sqlite", { Promise })
