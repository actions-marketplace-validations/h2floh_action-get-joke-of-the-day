import * as core from '@actions/core';
import {StatusCodes} from 'http-status-codes';
import * as rm from 'typed-rest-client/RestClient';

/**
 * Entrypoint of the Action, triggers the API call and catches any unhandled error states
 */
export async function run() {
  try {
    // `jokes-one-api-key` input defined in action metadata file
    const jokesOneApiKey = core.getInput('jokes-one-api-key');
    await getJokeOfTheDay(jokesOneApiKey);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

/**
 * Partial datamodel of the Joke object
 */
interface Joke {
  /** The title of the Joke */
  title: string;
  /** Attributes of the actual Joke */
  joke: {
    /** The actual joke as string */
    text: string;
  };
}

/**
 * Partial datamodel of the API Response JSON
 */
export interface JokeResult {
  /** Jokes content wrapper object */
  contents: {
    /** List of Jokes */
    jokes: Joke[];
  };
}

/**
 * Processing actual business logic
 * 1. checking if API key was provided and accordingly prepare HTTP header
 * 2. Call API and print Joke and set as Action output
 */
export async function getJokeOfTheDay(apiKey: string): Promise<boolean> {
  const restClient = new rm.RestClient(
    'github-action-get-joke-of-the-day',
    'https://api.jokes.one'
  );

  const requestOptions: rm.IRequestOptions = {acceptHeader: 'application/json'};
  if (apiKey !== 'none') {
    requestOptions.additionalHeaders = {'X-JokesOne-Api-Secret': apiKey};
  }
  const response = await restClient.get<JokeResult>('/jod', requestOptions);

  if (response.statusCode === StatusCodes.OK) {
    const joke = response.result?.contents.jokes[0].joke.text;
    console.log(`Joke of the day: ${joke}`);
    core.setOutput('joke', joke);
  } else {
    core.setFailed(JSON.stringify(response));
  }

  return true;
}
