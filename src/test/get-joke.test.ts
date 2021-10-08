import * as core from '@actions/core';
import * as rm from 'typed-rest-client/RestClient';
import * as main from '../get-joke';
import {StatusCodes} from 'http-status-codes';

let jokeOneResponseJsonData = require('./data/jokeone_result.json');

describe('get-joke', () => {

    // ACTION TEST&MOCK SPECIFIC SETUP 
    // COPIED FROM https://github.com/actions/setup-go/blob/main/__tests__/setup-go.test.ts
    // AND EXTENDED WITH Jokes.One API MOCK

    let inputs = {} as any;  
    let inSpy: jest.SpyInstance;
    let cnSpy: jest.SpyInstance;
    let logSpy: jest.SpyInstance;
    let dbgSpy: jest.SpyInstance;
    let outSpy: jest.SpyInstance;
    let apiSpy: jest.SpyInstance;
    let failedSpy: jest.SpyInstance;

    beforeAll(() => {
        process.env['GITHUB_PATH'] = ''; // Stub out ENV file functionality so we can verify it writes to standard out
        console.log('::stop-commands::stoptoken'); // Disable executing of runner commands when running tests in actions
      });
    
      beforeEach(() => {
        // @actions/core
        inputs = {};
        inSpy = jest.spyOn(core, 'getInput');
        inSpy.mockImplementation(name => inputs[name]);
     
        // writes
        cnSpy = jest.spyOn(process.stdout, 'write');
        logSpy = jest.spyOn(core, 'info');
        dbgSpy = jest.spyOn(core, 'debug');
        outSpy = jest.spyOn(core, 'setOutput');
        failedSpy = jest.spyOn(core, 'setFailed');
        cnSpy.mockImplementation(line => {
          // uncomment to debug
          // process.stderr.write('write:' + line + '\n');
        });
        logSpy.mockImplementation(line => {
          // uncomment to debug
          // process.stderr.write('log:' + line + '\n');
        });
        dbgSpy.mockImplementation(msg => {
          // uncomment to see debug output
          // process.stderr.write(msg + '\n');
        });
        outSpy.mockImplementation((name, value) => {
            // uncomment to see setOutput output
            // process.stderr.write(name + ':' + value + '\n');
        });
        failedSpy.mockImplementation(msg => {
            // uncomment to see debug output
            // process.stderr.write(msg + '\n');
        });

        // JokeOne API
        apiSpy = jest.spyOn(rm.RestClient.prototype, 'get');
        apiSpy.mockImplementation(() => {
            const response: rm.IRestResponse<main.JokeResult> = {
                statusCode: StatusCodes.OK,
                headers: {},
                result: jokeOneResponseJsonData as main.JokeResult
            }
            return response;
        })
      });
    
      afterEach(() => {
        inputs = {};
        jest.resetAllMocks();
        jest.clearAllMocks();
        //jest.restoreAllMocks();
      });
    
      afterAll(async () => {
        console.log('::stoptoken::'); // Re-enable executing of runner commands when running tests in actions
      }, 100000);


      it('happy path - returns a joke without api key', async () => {
        inputs['jokes-one-api-key'] = 'none'; 
        await main.run();
        expect(outSpy).toHaveBeenCalledWith('joke', 'Q. Why shouldn\'t you marry a tennis player?\r\nA. Because Love means nothing to them.');
        expect(apiSpy).toHaveBeenCalledTimes(1);
        expect(apiSpy).toHaveBeenCalledWith('/jod', {"acceptHeader": "application/json"});
      });


      it('happy path - returns a joke with api key', async () => {
        inputs['jokes-one-api-key'] = 'ABCD1234'; 
        await main.run();
        expect(outSpy).toHaveBeenCalledWith('joke', 'Q. Why shouldn\'t you marry a tennis player?\r\nA. Because Love means nothing to them.');
        expect(apiSpy).toHaveBeenCalledTimes(1);
        expect(apiSpy).toHaveBeenCalledWith('/jod', {"acceptHeader": "application/json", "additionalHeaders": {"X-JokesOne-Api-Secret": "ABCD1234"}});
      });

      it('oops path - something went wrong on the API', async () => {
        inputs['jokes-one-api-key'] = 'none'; 
        const response: rm.IRestResponse<string> = {
            statusCode: StatusCodes.PAYMENT_REQUIRED,
            headers: {},
            result: 'You need to pay!'
        };
        
        apiSpy.mockImplementationOnce((path => {
            
            return response;
        }));

        await main.run();
        expect(apiSpy).toHaveBeenCalledTimes(1);
        expect(apiSpy).toHaveBeenCalledWith('/jod', {"acceptHeader": "application/json"});
        expect(failedSpy).toHaveBeenCalledWith(JSON.stringify(response));
      });

      it('oops path - something went wrong API sends unexpected result', async () => {
        inputs['jokes-one-api-key'] = 'none'; 
        const response: rm.IRestResponse<string> = {
            statusCode: StatusCodes.OK,
            headers: {},
            result: 'You will not be able to process this payload'
        };
        
        apiSpy.mockImplementationOnce((path => {
            
            return response;
        }));

        await main.run();
        expect(apiSpy).toHaveBeenCalledTimes(1);
        expect(apiSpy).toHaveBeenCalledWith('/jod', {"acceptHeader": "application/json"});
        expect(failedSpy).toHaveBeenCalledWith("Cannot read property 'jokes' of undefined");
      });


      it('integration test - Works with the real API', async () => {
        inputs['jokes-one-api-key'] = 'none';

        await main.run();
        expect(outSpy).toHaveBeenCalled();
      });
    
});