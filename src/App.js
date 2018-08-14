import React from "react";
import { render } from "react-dom";
import { makeData, Logo, Tips } from "./Utils";
import {FormGroup, FormControl} from 'react-bootstrap';
import _ from "lodash";

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

// pull in the HOC
import treeTableHOC from "react-table/lib/hoc/treeTable";

import testData from "./test_data2";

var reformatteddata = testData.map(obj => {
  return { ...obj.body.attendee, 
      error: obj.error,
      created_at: obj.created_at,
      function:obj.body.function

  }
}) 
// [];
// for (var i = 0; i <testData.length; i++){
//   var object2={"create_at":""};
 
 
//   object2 = Object.assign(object2, testData[i].created_at);
//   reformatteddata.push(object2);
  
  
// }
// console.log(reformatteddata);
// wrap ReacTable in it
// the HOC provides the configuration for the TreeTable
const TreeTable = treeTableHOC(ReactTable);

function getTdProps(state, ri, ci) {
  console.log({ state, ri, ci });
  
  return {};
}

// getTdProps={getTdProps}
// Expander={Expander}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      // data: makeData()
      data: reformatteddata
    };
    this.dataload = this.dataload.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    var _url = "";

  }
 
  componentDidMount() {
    console.log("enter");
    this.dataload().then(data=>{
      this.setState({data});
    });
  }
  onSubmit(e){
    e.preventDefault();
  }
  dataload(){
    return new Promise((resolve, reject)=>{
      var xhr = new XMLHttpRequest();
      let url = "https://files.prolaera.com/errors/kinesis/msGraphStream-prod/msGraphStream-prod_08_13_2018.json";
      xhr.open('Get',url,true);
      xhr.responseType='json';
      xhr.onload = function(){
        if (xhr.status === 200) {
          var newdata = xhr.response;
          console.log(newdata);
          var reformatteddata = newdata.map(obj => {
            return { ...obj.body.attendee, 
                error: obj.error,
                created_at: obj.created_at,
                function:obj.body.function
          
            }
          }) 
          resolve(reformatteddata);
        }
        else{
          reject(Error(xhr.statusText));
        }

      }
      xhr.send();
    })
  }
  render() {
    const { data } = this.state;
    // now use the new TreeTable component
    return (
      <div>
      <form id ="reset">
      <FormGroup >
      <FormControl type="text" id="title" placeholder="title" onChange={(e)=>{this._url=e.target.value}} />
      </FormGroup>
      <button onClick ={(e) =>this.onSubmit(e)}>submit</button>
      </form>

        <TreeTable
          filterable
          defaultFilterMethod={(filter, row, column) => {
            
            const id = filter.pivotId || filter.id;
            return row[id] !== undefined
              ? String(row[id])
                  .toLowerCase()
                  .includes(filter.value.toLowerCase())
              : true;
          }}
          data={data}
          pivotBy={["company_id","profile_uid"]}
          columns={[
            // we only require the accessor so TreeTable
            // can handle the pivot automatically
            {
              accessor: "company_id"
            },
            {
              accessor: "profile_uid"
            },
          


            // any other columns we want to display
            {
              Header: "Company ID",
              accessor: "company_id"
            },
            {
              Header: "Profile UID",
              accessor: "profile_uid"
            }
            ,
            {
               Header: "Created_at",
               accessor: "created_at"
             },
             {
               Header: "Function",
               accessor: "function"
             },
             {
               Header: "Error",
               accessor: "error"
             }
          ]}
          defaultPageSize={10}
          SubComponent={row => {
            // a SubComponent just for the final detail
            const columns = [
              {
                Header: "Property",
                accessor: "property",
                width: 200,
                Cell: ci => {
                  return `${ci.value}:`;
                },
                style: {
                  backgroundColor: "#DDD",
                  textAlign: "right",
                  fontWeight: "bold"
                }
              },
              { Header: "Value", accessor: "value" }
            ];
            const rowData = Object.keys(row.original).map(key => {
              return {
                property: key,
                value: row.original[key].toString()
              };
            });
            return (
              <div style={{ padding: "10px" }}>
                <ReactTable
                  data={rowData}
                  columns={columns}
                  pageSize={rowData.length}
                  showPagination={false}
                />
              </div>
            );
          }}
        />
        <br />
        <Tips />
        <Logo />
      </div>
    );
  }
}

export default App;
