import * as core from '@actions/core';
import * as rm from 'typed-rest-client/RestClient';
import {StatusCodes} from 'http-status-codes';

export async function run() {
  try {
    // `jokes-one-api-key` input defined in action metadata file
    const jokesOneApiKey = core.getInput('jokes-one-api-key');
    await getJokeOfTheDay(jokesOneApiKey);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

interface Joke {
  title: string;
  joke: {
    text: string;
  };
}

export interface JokeResult {
  contents: {
    jokes: Joke[];
  };
}

export async function getJokeOfTheDay(apiKey: string): Promise<boolean> {
  const restClient = new rm.RestClient(
    'github-action-get-joke-of-the-day',
    'https://api.jokes.one'
  );

  let requestOptions: rm.IRequestOptions = {acceptHeader: 'application/json'};
  if (apiKey != 'none') {
    requestOptions.additionalHeaders = {'X-JokesOne-Api-Secret': apiKey};
  }
  const response = await restClient.get<JokeResult>('/jod', requestOptions);

  if (response.statusCode == StatusCodes.OK) {
    const joke = response.result?.contents.jokes[0].joke.text;
    console.log(`Joke of the day: ${joke}`);
    core.setOutput('joke', joke);
  } else {
    core.setFailed(JSON.stringify(response));
  }

  return true;
}
