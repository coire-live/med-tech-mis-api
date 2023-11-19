require("dotenv").config();
const express = require("express");
const cors = require("cors");

const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequelize = require('../config/database');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const { PORT, SESSION_SECRET } = process.env;
const port = PORT || 5050;

const sessionStore = new SequelizeStore({
  db: sequelize,
});

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    name: 'mis.connect.sid',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);


sequelize
.authenticate()
.then(() => {
  sessionStore
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Session store sync error:', error);
  });
})
.catch(() => {
  console.log("Server failure!");
  process.exit(1);
});


app.use("/api/v1/", require("../routes/apiRoutes"));
app.use("*", (req, res) => res.redirect("/"));