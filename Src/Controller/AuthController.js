var sql = require("mssql/msnodesqlv8");
const bcrypt = require("bcrypt");

const { getToken, db_config } = require("../Utils/utils");

const saltRounds = 10;

const login = (req, res) => {
  if (req.body.userName == "" || req.body.password == "") {
    res.send({ error: "Invalid Data" });
    throw new Error("Invalid Data");
  }

  sql
    .connect(db_config)
    .then(pool => {
      return pool
        .request()
        .input("userName", sql.NVarChar, req.body.userName)
        .query("select * from Login where UserName=@userName");
    })
    .then(async result => {
      if (result.recordset.length > 0) {
        let match = await bcrypt.compare(
          req.body.password,
          result.recordset[0].Password
        );

        if (match) {
          let token = await getToken(req.body.userName);
          res.status(200).json(token);
        } else {
          res.send({ error: "Invalid Password" });
          throw new Error("Invalid Password");
        }
      } else {
        res.send({ error: "Invalid User Name" });
        throw new Error("Invalid User Name");
      }

      sql.close();
    })
    .catch(err => {
      sql.close();
      console.log(err);
    });
};

const signup = async (req, res) => {
  if (req.body.userName == "" || req.body.password == "") {
    res.send({ error: "INVALID DATA" });
    throw new Error("INVALID DATA");
  }

  let hashPassword = await bcrypt.hash(req.body.password, saltRounds);

  sql
    .connect(db_config)
    .then(pool => {
      return pool
        .request()
        .input("userName", sql.NVarChar, req.body.userName)
        .query("select * from Login where UserName=@userName")
        .then(result => {
          if (result.recordset.length == 0) {
            return pool
              .request()
              .input("userName", sql.NVarChar, req.body.userName)
              .input("password", sql.NVarChar, hashPassword)
              .query(`INSERT INTO [Login] values (@userName,@password)`);
          } else {
            res.send({ error: "User Already exists" });
            throw new Error("User Already exists");
          }
        });
    })
    .then(async result => {
      let token = await getToken(req.body.userName);
      res.status(200).json(token);
      sql.close();
    })
    .catch(err => {
      sql.close();
      console.log(err);
    });
};

module.exports = { login, signup };
