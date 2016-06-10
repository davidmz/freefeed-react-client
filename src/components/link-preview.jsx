import React from 'react';
import Iframely from './iframely';

export default ({url}) => {
  const frfLink = /^https:\/\/([a-z0-9-]+\.)?freefeed\.net(\/|$)/i.test(url);
  return frfLink ? <div /> : <Iframely url={url}/>;
};