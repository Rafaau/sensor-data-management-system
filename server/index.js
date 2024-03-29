const express = require("express")
const bodyParser = require("body-parser");
const cors = require("cors")

const db = require("./db")
const seedDB = require("./db/seeder")
const dataRouter = require("./routes/sensordata-router")

const app = express()
const apiPort = 5000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json())

db.on("error", console.error.bind(console, "MongoDB connection error: "))

app.get("/", (req, res) => {
    res.send("Hello world")
})

app.use("/api", dataRouter)
app.use("/api/files", express.static("files"))
app.use("/files", (req, res, next) => { console.log(req.body) })

seedDB()

app.listen(apiPort, "0.0.0.0", () => console.log(`Server running on port ${apiPort}`))

module.exports = app