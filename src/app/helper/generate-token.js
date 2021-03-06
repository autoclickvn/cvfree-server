const jwt = require('jsonwebtoken')
const promisify = require('util').promisify
const sign = promisify(jwt.sign).bind(jwt)

const generateToken = async (payload, secretSignature, tokenLife) => {
	try {
		return await sign(
			{ payload },
			secretSignature,
			{
				algorithm: 'HS256',
				expiresIn: tokenLife,
			},
		);
	} catch (e) {
		console.log(`Error in generate access token:  + ${e}`)
		return null
	}
};

module.exports = generateToken