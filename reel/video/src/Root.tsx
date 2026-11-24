import React from 'react';
import {Composition} from 'remotion';
import {Reel, DURATION, FPS} from './Reel';
export const Root: React.FC = () => (
  <Composition id="Reel" component={Reel} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{avatar: 'avatar.png'}} />
);
