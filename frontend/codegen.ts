import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:4000/graphql',
  documents: ['./src/**/*.tsx'],
  generates: {
    './src/graphql/__generated__/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
  ignoreNoDocuments: true,
  config: {
    skipTypename: true,
    // enumsAsTypes: true,
    constEnums: true,
    onlyOperationTypes: true,
  },
};

export default config;
