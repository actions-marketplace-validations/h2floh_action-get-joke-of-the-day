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
  text: string;
}

interface JokeResult {
  contents: {
    jokes: Joke[];
  };
}

export async function getJokeOfTheDay(apiKey: string): Promise<boolean> {
  const restClient = new rm.RestClient(
    'jokes-one-api',
    'https://api.jokes.one'
  );

  const response = await restClient.get<JokeResult>('/jod');

  if (response.statusCode == StatusCodes.OK) {
    const joke = response.result?.contents.jokes[0].text;
    console.log(`Joke of the day: ${joke}`);
    core.setOutput('joke', joke);
  } else {
    core.setFailed(JSON.stringify(response));
  }

  return true;
}
