const express = require("express");
const fs = require("fs");
const app = express(); //creating express application
const port = 8888;

//middleware code
app.use(express.json()); //middleware, this has to be added before writing app.post()
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const employees = JSON.parse(
  fs.readFileSync(`${__dirname}/Data/employeeinfo.json`)
);

//request handlers
const getAllEmp = (req, res) => {
  res.status(200).json({
    status: "Suceess",
    dateTime: req.requestTime, //this uses middleware
    results: employees.length,
    data: { employeeinfo: employees },
  });
};

const addEmp = (req, res) => {
  const newEmpId = employees[employees.length - 1].id + 1; //creating the incremental id for new object
  const newEmployee = Object.assign(
    {
      id: newEmpId,
    },
    req.body
  );

  employees.push(newEmployee);
  fs.writeFile(
    `${__dirname}/Data/employeeinfo.json`,
    JSON.stringify(employees),
    (err) => {
      res.status(201).json({
        status: "Successfully added",
        employees: newEmployee,
      });
    }
  );
};

const getEmpbyId = (req, res) => {
  const eId = req.params.id * 1; //it will be string by default, hence mul with 1
  const reqEmp = employees.find((e) => e.id === eId);
  if (eId > employees.length) {
    //if(!employee) can also be done
    res.status(404).json({
      Status: "Employee not found",
      Details: "Employee id is invalid",
    });
  } else {
    res.status(200).json({
      Status: "Employee found!",
      Details: reqEmp,
    });
  }
};

const deleteById = (req, res) => {
  if (req.params.id * 1 > employees.length) {
    return res.status(404).json({
      Status: "Employee not found",
      Description: "Invalid employee id!",
    });
  } else {
    const eId = req.params.id * 1;
    const reqEmpIdx = employees.findIndex((e) => e.id === eId);
    const newemployeeList = employees.splice(reqEmpIdx, 1);

    fs.writeFile(
      `${__dirname}/Data/employeeinfo.json`,
      JSON.stringify(employees),
      (err) => {
        res.status(201).json({
          status: "Successfully removed",
          employees: newemployeeList,
        });
      }
    );
  }
};

//Using router,
//Less modifications, while updating routing urls

//Routes - Mounting of multiple routers
const employeeRouter = express.Router();
//These are middlewares applied to routes
app.use("/api/v1/employees", employeeRouter); //This is same for all urls

employeeRouter.route("/").get(getAllEmp).post(addEmp);
employeeRouter.route("/:id").get(getEmpbyId).delete(deleteById);

app.listen(port, () => {
  console.log(`Express app is running in port ${port}`);
});
