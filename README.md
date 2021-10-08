# Get Joke Of The Day

This action retrieves the 'Joke of the Day' from the https://jokes.one/ API and prints it to the workflow step output log.

## Inputs

## `jokes-one-api-key`

**Optional** Your Jokes One API Key. Default `"None"`.

## Outputs

## `joke`

The Joke of the Day.

## Example usage

Without API Key:

```
uses: h2floh/action-get-joke-of-the-day@v1
```

With API Key [for security reasons you should store your API Key as a [GitHub Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) and reference it in the workflow]:

```
uses: h2floh/action-get-joke-of-the-day@v1
with:
  jokes-one-api-key: ${{ secrets.<YOURAPISECRET> }}
```