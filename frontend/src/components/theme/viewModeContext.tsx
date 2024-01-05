// ViewModeContext.js
import React from 'react';
import { ViewMode, ViewModeProps } from '../interfaces/interfaces';

const ViewModeContext = React.createContext<ViewModeProps>({
  mode: ViewMode.Classic,
  setMode: (mode: ViewMode) => {},
});

export default ViewModeContext;
