const express = require("express");
const fs = require("fs");
const app = express(); //creating express application
const port = 8888;
app.use(express.json()); //middleware, this has to be added before writing app.post()
//After using this middleware, it gives the req.body on console

//minimal amount of code, provides better way of handle request

app.listen(port, () => {
  console.log(`Express app is running in port ${port}`);
}); //it automatically creates server, rather creating server unlike nodejs

//------------------------------------------------------------------------------------------
// //it automatically gives a html file if page is not found, or request type is different
// app.get("/", (req, res) => {
//   res.status(200);
//   res.json({
//     message: "Hello, this is written inside json message.",
//     app: "AppName",
//   });
//   //comes out after json, if send is writen before json, then it will not execute json
//   res.send("hello from express!!!");
// });

// app.post("/", (req, res) => {
//   res.send("Please go to the login");
// }); //if post is pressed, it gives the custom message, rather than the default "cannot post /" statement
//------------------------------------------------------------------------------------------

const employees = JSON.parse(
  fs.readFileSync(`${__dirname}/Data/employeeinfo.json`)
); //__dirname gives the directory name of current code
//employees is in the buffer format, so parse it to json format

app.get("/api/v1/employees", (req, res) => {
  res.status(200).json({
    status: "Suceess",
    results: employees.length,
    data: { employeeinfo: employees },
  });
});

app.post("/api/v1/employees", (req, res) => {
  // console.log(req.body); //if given json data, it prints undefined, bcz this doens't work with json that's why we use middleware
  //before going to post request, it goes to middle ware, A layer thorugh which it passes before post
  //any number of middleware can be generated and used
  //Middleware has to be added at the top, before app.post, that handles only type of middleware where the body is json, it parses them

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
  ); //sych causes problems so use async
  //  res.send("Added successfully!");
});

//get emp by id
//path/:param1/:param2/:param3
app.get("/api/v1/employees/:empId/:name?/", (req, res) => {
  //console.log(req.params); //name is made optional by using ?
  //or req.params.empId -> gives the empId

  //http://localhost:8888/api/v1/employees/6

  const eId = req.params.empId * 1; //it will be string by default, hence mul with 1
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
  //res.send("done"); //o/p: { empId: 'empId=11', name: 'name=Aayush' }
});

//Deleting
app.delete("/api/v1/employees/:id", (req, res) => {
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
});
