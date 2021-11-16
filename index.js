const oracledb = require('oracledb');
const axios = require('axios');
const dbConfig = {
    user: 'REMIT',
    password: 'remit',
    connectString: '10.11.201.251:1521/stlbas'
};
const soapRequest = require('easy-soap-request');
const xml2js = require('xml2js');
// const node_xml_stream = require('node-xml-stream');
// const parser = new node_xml_stream();

options = {
    // outFormat: oracledb.OUT_FORMAT_OBJECT // uncomment if you want object output instead of array
};

async function procedureCall() {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        sql = 'begin dpr_tr_test(:in_reason_code,:in_reason_desc,:Out_Message,:Out_Code); end;';
        const ticker_data = {
            in_reason_code: '',
            in_reason_desc: '',
            Out_Message: '',
            Out_Code: '',

        };
        const data = {
            in_reason_code: '0',
            in_reason_desc: 'TEST IS ON',
            Out_Message: {
                dir: oracledb.BIND_OUT,
                type: oracledb.STRING,
                maxSize: 40
            },
            Out_Code: {
                dir: oracledb.BIND_OUT,
                type: oracledb.STRING,
                maxSize: 40
            }
        };
        const binds = Object.assign({}, ticker_data, data);

        result = await connection.execute(sql, binds, options);
        console.log(result.outBinds);

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}
//procedureCall();

async function RIA() {
    try {

        const options = {
            headers: {
                'ria-CallerCorrelationId': 'BA2018',
                'ria-CallDateTimeLocal': '20211018115931',
                'ria-AgentId': '50445411',
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': '0da16678c7194673921f8da6b9558526'
            }
        };
        let riaApiResponse = await axios.get('https://stagingapi.rialink.net/PayOrders/Orders/Downloadable', options);
        let apiResponseData = riaApiResponse.data;
        let apiResponseCode = riaApiResponse.status;
        console.log(apiResponseCode);
        if (apiResponseCode !== 200) {
            console.log("API problem found");
        } else {
            console.log(apiResponseData);
        }

    } catch (error) {
        console.log("API problem found: " + error);
    }
}
//RIA();

async function xmltest(xmlResponse) {
    let jsonFormat;
    xml2js.parseString(xmlResponse, (err, result) => {
        if (err) {
            throw err;
        }

        // `result` is a JavaScript object
        // convert it to a JSON string
        const json = JSON.stringify(result, null, 4);

        // log JSON string
        console.log(typeof (json));
        // console.log(json.substring(1, 5));
        // jsonFormat = JSON.parse(json);
        jsonFormat = json;
        // jsonFormat = json.substring(1, 5);

    });

    return jsonFormat;
}

// headers data of ictc
const Agent_User_ID = "BD00002579";
const Agent_Password = "DSD886";
const Agent_Correspondent_ID = "BD0396";
const ExhouseCode = "E41";
let xmlResponse;

// Example data
const url = 'https://icuatapp.wallstreet.ae/IcIntegration/IcWebservice.asmx';
const sampleHeaders = {
    'Content-Type': 'text/xml;charset=UTF-8'
};
const xml = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:icws=\"ICWS\">" +
    "<soapenv:Header>" +
    "<icws:AuthHeader>" +
    "<icws:Agent_UserID>" +
    Agent_User_ID +
    "</icws:Agent_UserID>" +
    "<icws:User_Password>" +
    Agent_Password +
    "</icws:User_Password>" +
    "<icws:Agent_CorrespondentID>" +
    Agent_Correspondent_ID +
    "</icws:Agent_CorrespondentID>" +
    "</icws:AuthHeader>" +
    "</soapenv:Header>" +
    "<soapenv:Body>" +
    "<icws:GetOutstandingRemittance/>" +
    "</soapenv:Body>" +
    "</soapenv:Envelope>";

// usage of module

(async () => {
    const {
        response
    } = await soapRequest({
        url: url,
        headers: sampleHeaders,
        xml: xml
        // timeout: 1000
    }); // Optional timeout parameter(milliseconds)
    const {
        headers,
        body,
        statusCode
    } = response;
    xmlResponse = response.body;
    // test
    const jsonResponse = await xmltest(xmlResponse);
    console.log(jsonResponse);
    // test
    // console.log(headers);
    // console.log(body);
    // console.log(statusCode);
})();