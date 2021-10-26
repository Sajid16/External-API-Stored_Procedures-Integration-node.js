const oracledb = require('oracledb');
const axios = require('axios');
const dbConfig = {
    user: 'REMIT',
    password: 'remit',
    connectString: '10.11.201.251:1521/stlbas'
};

options = {
    // outFormat: oracledb.OUT_FORMAT_OBJECT // uncomment if you want object output instead of array
};

async function run() {
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

run();

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

RIA();