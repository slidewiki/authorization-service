/*
Handler between called routes and controllers.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
  co = require('../common'),
  socialProvider = require('./social_provider');

module.exports = {
  //using OAuth token
  continueWithToken: function (req, res, provider) {
    socialProvider.getUserCredentials(req.query.access_token, provider)
      .then((user) => {
        //TODO
        res(JSON.stringify(user));
      })
      .catch((error) => {
        req.log('error', error);
        res(boom.badImplementation());
      });
  }
};
/*
{
  "user": {
    "name": "Kurt Junghanns",
    "location": "de",
    "url": "https://plus.google.com/109469747399244919883",
    "id": "109469747399244919883",
    "email": "tboonx@googlemail.com",
    "nickname": "tboonx"
  },
  "query": {
    "access_token": "ya29.CjL1AuOw5PJih5i8_TC7lU9WVGtl4YhRt3Vty0yeC-kUx6q0CxY5enPndGfUEprLcai2rw",
    "raw[access_token]": "ya29.CjL1AuOw5PJih5i8_TC7lU9WVGtl4YhRt3Vty0yeC-kUx6q0CxY5enPndGfUEprLcai2rw",
    "raw[token_type]": "Bearer",
    "raw[expires_in]": "3600",
    "raw[id_token]": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjExZWJkODJmZjZmODc3NjQyNWExZmE1ODk0ZTlhYTlhNjEwOWI0ODQifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXRfaGFzaCI6Ind5UU80eU1nR0h5OHdrRlR2SzFMRlEiLCJhdWQiOiIxMDc5MTk5NTYyMTY5LTJuamk5YnFiaDdjOTdicWg5NGU0MzE5aXZwNm1pYWtjLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA5NDY5NzQ3Mzk5MjQ0OTE5ODgzIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6IjEwNzkxOTk1NjIxNjktMm5qaTlicWJoN2M5N2JxaDk0ZTQzMTlpdnA2bWlha2MuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJlbWFpbCI6InRib29ueEBnb29nbGVtYWlsLmNvbSIsImlhdCI6MTQ2NDg3NTg5MiwiZXhwIjoxNDY0ODc5NDkyfQ.t3V3nDCnuuuZXGGphw2zRsVVdpeW95NRn-AHwIflcs93JRg47z9f-pIeCm2pDZ6KsNyck3PdVSjxesD4hBfc_oMKXXRVnoFh8BqM1-VVpI7HIVbG3ibcM9caDIZeuPsEsI5ktk_ocy9ejlBPEMI2AbGNpYdYTB6R09EUHSjQadDRDiD_g-j_SneVrCrmcJxHpYGQbkE_BG_F9X5vCCaehlkIWVdT5OMfy5b1xhol2WGLv_NIH_bEGx-zXsVqOGIlDpeV3nq76w__op0x7rFllO53LJEr0KjpIzJoxLQJi0Hgb4bXxl0IZpe2r1_p__t6zyQMZEj5BrFrF7gADaVUVQ"
  }
} {
  "user": {
    "nickname": "TBoonX",
    "id": 3153545,
    "url": "https://github.com/TBoonX",
    "name": "Kurt Junghanns",
    "company": "Institut für Angewandte Informatik e. V.",
    "location": "Deutschland",
    "email": null
  },
  "query": {
    "access_token": "07f2399a87c951a04063c71eb42b67909d07f584",
    "raw[access_token]": "07f2399a87c951a04063c71eb42b67909d07f584",
    "raw[scope]": "user",
    "raw[token_type]": "bearer"
  }
}
*/
