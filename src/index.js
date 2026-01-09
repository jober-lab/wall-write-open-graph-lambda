const https = require('https');

 /* 이미지 호출 방식은 더 고민해보고 결정 */
const getDocumentOption = (apiBaseUrl, documentOptionId) => new Promise((resolve, reject) => {
  https.get(`${apiBaseUrl}/space-wall/document-option/${documentOptionId}`, (response) => {
    console.log('documentOptionId : ',documentOptionId);
    let rawData = '';
    response.on('data', (chunk) => {
      rawData += chunk;
    });

    response.on('end', () => {
      const parseResponse = JSON.parse(rawData);
      console.log('getDocumentOption parseResponse : ',parseResponse)
      if (!parseResponse || !parseResponse.data || !parseResponse.data.documentOption) {
        reject(new Error('invalid response for getDocumentOption'));
      }
      
      const wallUrlPath = parseResponse.data.targetWallUrlPath;
      console.log('wallUrlPath : ',wallUrlPath);
      const documentOption = parseResponse.data.documentOption;
      const targetWallUrlList = wallUrlPath.split("/");
      const targetWallUrlPath = targetWallUrlList[targetWallUrlList.length -1];
      console.log('targetWallUrlPath : ',targetWallUrlPath);
      
      resolve({...documentOption, targetWallUrlPath});
    });
  }).on('error', (err) => {
    reject(err);
  });
});

const getWallDataByUrl = (apiBaseUrl, wallUrl) => new Promise((resolve, reject) => {
  https.get(`${apiBaseUrl}/space-wall/thumbnail/${wallUrl}`, (response) => {
    
    
    let lawData = '';
    response.on('data', (chunk) => {
      lawData += chunk;
    });

    response.on('end', () => {
      const parseResponse = JSON.parse(lawData);
      console.log('getWallDataByUrl parseResponse : ',parseResponse)
      if (!parseResponse || !parseResponse.data) {
        reject(new Error('invalid response for getWallDataByUrl'));
      }

      resolve(parseResponse.data);
    });
  }).on('error', (err) => {
    reject(err);
  });
});

// const getFrameInfo = (apiBaseUrl, documentFrameId) => new Promise((resolve, reject) => {
//   if (!documentFrameId) reject(new Error('invalid response'));
  
//   https.get(`${apiBaseUrl}/document-frame/write/public/one?id=${documentFrameId}`, (response) => {
//     let rawData = '';
//     response.on('data', (chunk) => {
//       rawData += chunk;
//     });

//     response.on('end', () => {
//       const parseResponse = JSON.parse(rawData);
//       if (!parseResponse || !parseResponse.data || parseResponse.data.includePdf || !parseResponse.data.frameInputSections || !parseResponse.data.frameInputSections.length) {
//         reject(new Error('invalid response'));
//       }

//       resolve(parseResponse.data);
//     });
//   }).on('error', (err) => {
//     reject(err);
//   });
// });

const getApiBaseUrlByHost = (host) => {
  switch (host) {
    case 'jober-dev-api-client2.s3.ap-northeast-2.amazonaws.com':
      return 'https://dev-api2.jober.io';
    case 'jober-dev-api-client.s3.ap-northeast-2.amazonaws.com':
      return 'https://dev-api.jober.io';
    case 'jober-api-client.s3.ap-northeast-2.amazonaws.com':
    default:
      return 'https://api.jober.io';
  }
};

exports.handler = async (event, context, callback) => {
  console.log('=== Wall Write Open Graph Lambda Started ===');
  console.log('Deployment test - Version:', new Date().toISOString());
  console.log('event: ', event);
  console.log('context: ', context);
  console.log('callback: ', callback);
  
  try {
    const { request, response } = event.Records[0].cf;

    const { headers, method, uri } = request || {};
    const host = request.headers.host.find(h => h.key === 'Host').value;
    console.log('host', host);
    console.log('headers', headers);
    console.log('uri', uri);

    const normalizedUri = uri.replace(/\/$/, '');

    const userAgentHeader = request.headers['user-agent'] ? request.headers['user-agent'][0].value : '';
  console.log('User-Agent:', userAgentHeader);

    const isKnownBot = 'is-bot' in headers && headers['is-bot'][0].value.toLowerCase() === 'true'
    const isScraperUserAgent = userAgentHeader.match(
      /bot|crawler|spider|facebook|twitter|pinterest|linkedin|kakao|preview|whatsapp|line|slack|google|bing|naver|daum/i
    );

    const shouldUpdateOpenGraph = (isKnownBot || isScraperUserAgent) && method === 'GET';
    console.log('shouldUpdateOpenGraph', shouldUpdateOpenGraph);

    if (shouldUpdateOpenGraph) {
      const apiBaseUrl = getApiBaseUrlByHost(host);
      const documentOptionId = normalizedUri.split('/').pop();

      const { frameInfo, thumbnailImageUrl: thumbnailImageUrlFromDocumentOption, targetWallUrlPath: wallUrl } = await getDocumentOption(apiBaseUrl, documentOptionId);
      
      let ogImageUrl = 'https://s3-ap-northeast-2.amazonaws.com/jober-api-editor/uploads%2F1681179681657-space-wall-write-og-image.png';
      if (thumbnailImageUrlFromDocumentOption) ogImageUrl = thumbnailImageUrlFromDocumentOption;
      if(wallUrl && !thumbnailImageUrlFromDocumentOption) {
        const {
          thumbnailImageUrl = '',
        } = await getWallDataByUrl(apiBaseUrl, wallUrl);
        
        if (thumbnailImageUrl) ogImageUrl = thumbnailImageUrl;
      }
      
      console.log('ogImageUrl: ', ogImageUrl);
      // const { title } = await getFrameInfo(apiBaseUrl, documentFrameId);
      // const { description, imageUrl } = frameInputSections[0];
      
      // console.log(documentFrameId, title, frameInputSections, description, imageUrl);
      
      const defaultDescription = '자버 전자문서';
      
      response.status = 200;
      response.statusDescription = 'OK';

      response.body = `<html><head>
          <meta charset="UTF-8" />
          <meta property="og:url" content="${`${host}${uri}`}" />
          <meta property="og:type" content="website" />
          <meta property="og:locale" content="en_US" />
          <meta property="og:title" content="${frameInfo.title}" />
          <meta property="og:description" content="${defaultDescription}"/>
          <meta property="og:image" content="${ogImageUrl}" />
          <meta property="og:image:width" content="600" />
          <meta name="twitter:title" content="${frameInfo.title}">
          <meta name="twitter:description" content="${defaultDescription}">
          <meta name="twitter:image" content="${ogImageUrl}">
          <meta name="twitter:card" content="summary">
          <title>${frameInfo.title}</title>
        </head></html>`;

      response.headers['content-type'] = [{
        key: 'Content-Type',
        value: 'text/html; charset=utf-8',
      }];
      response.headers['cache-control'] = [{
        key: 'Cache-Control',
        value: 'no-cache, no-store, must-revalidate',
      }];
    }

    callback(null, response);
  } catch (error) {
    console.log(error);
  }
};
