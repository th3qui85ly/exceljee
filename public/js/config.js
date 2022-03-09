const env = process.env.NODE_ENV || 'production'

//insert your API Key & Secret for each environment, keep this file local and never push it to a public repo for security purposes.
const config = {
	development :{
		APIKey : 'vcGhWn2nSdm6YfQ0ebQMUw',
		APISecret : 'h5whlmNbNsHuhytNfmP1igBgC1NnZWCjJGEE'
	},
	production:{
		APIKey : 'vcGhWn2nSdm6YfQ0ebQMUw',
		APISecret : 'h5whlmNbNsHuhytNfmP1igBgC1NnZWCjJGEE'
	}
};

module.exports = config[env]
