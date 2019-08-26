var sql = require("mssql/msnodesqlv8");
const { db_config } = require("../Utils/utils");

const addUser = (req, res) => {
  sql
    .connect(db_config)
    .then(pool => {
      return pool
        .request()
        .input("username", sql.NVarChar, req.user)
        .input("name", sql.NVarChar, req.body.name)
        .input("email", sql.NVarChar, req.body.email)
        .input("address", sql.NVarChar, req.body.address)
        .input("contact", sql.NVarChar, req.body.contact)
        .input("city", sql.NVarChar, req.body.city)
        .query(
          `INSERT INTO [User](UserName, Name, Email, Contact, Address, City)values (@username,@name,@email,@contact,@address,@city)`
        );
    })
    .then(result => {
      res.json(result);
      sql.close();
    })
    .catch(err => {
      sql.close();
      res.send({ error: "Email already exists" });
      throw new Error("Duplicate email");
    });
};

const getAllUsers = (req, res) => {
  sql
    .connect(db_config)
    .then(pool => {
      return pool.request().query("select * from [User]");
    })
    .then(result => {
      res.json(result);
      sql.close();
    })
    .catch(err => {
      sql.close();
      console.log(err);
    });
};

const getSingleUser = (req, res) => {
  sql
    .connect(db_config)
    .then(pool => {
      return pool
        .request()
        .input("id", sql.Int, req.params.id)
        .query("select * from [User] where Id=@id");
    })
    .then(result => {
      res.json(result);
      sql.close();
    })
    .catch(err => {
      sql.close();
      console.log(err);
    });
};

const updateUser = (req, res) => {
  let k = 0;
  let query = "UPDATE [User] SET ";
  if (req.body.name) {
    query += "Name=@name";
    k++;
  }
  if (req.body.email) {
    if (k != 0) query += ",Email=@email";
    else {
      k++;
      query += "Email=@email";
    }
  }
  if (req.body.address) {
    if (k != 0) query += ",Address=@address";
    else {
      k++;
      query += "Address=@address";
    }
  }
  if (req.body.contact) {
    if (k != 0) query += ",Contact=@contact";
    else {
      k++;
      query += "Contact=@contact";
    }
  }
  if (req.body.city) {
    if (k != 0) query += ",City=@city";
    else {
      k++;
      query += "City=@city";
    }
  }

  query += " WHERE Id=@id";

  sql
    .connect(db_config)
    .then(pool => {
      return pool
        .request()
        .input("name", sql.NVarChar, req.body.name)
        .input("email", sql.NVarChar, req.body.email)
        .input("address", sql.NVarChar, req.body.address)
        .input("contact", sql.NVarChar, req.body.contact)
        .input("city", sql.NVarChar, req.body.city)
        .input("id", sql.Int, req.params.id)
        .query(query);
    })
    .then(result => {
      if (result.rowsAffected[0] == 0) {
        res.send({ error: "Invalid User" });
        throw new Error("Invalid User");
      } else {
        res.json(result);
      }
      sql.close();
    })
    .catch(err => {
      sql.close();
      console.log(err);
    });
};

const deleteUser = (req, res) => {
  sql
    .connect(db_config)
    .then(pool => {
      return pool
        .request()
        .input("id", sql.Int, req.params.id)
        .query(`DELETE FROM [User] WHERE Id=@id`);
    })
    .then(result => {
      if (result.rowsAffected[0] == 0) {
        res.send({ error: "Invalid User" });
        throw new Error("Invalid User");
      } else {
        res.json(result);
      }
      sql.close();
    })
    .catch(err => {
      sql.close();
      console.log(err);
    });
};

module.exports = {
  addUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser
};
