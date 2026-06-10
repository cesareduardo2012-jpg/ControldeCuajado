import { createBrowserRouter } from 'react-router';
import { Root } from './components/Root';
import { HomeScreen } from './components/HomeScreen';
import { NewBatchForm } from './components/NewBatchForm';
import { ActiveBatches } from './components/ActiveBatches';
import { CheeseTypeConfig } from './components/CheeseTypeConfig';
import { History } from './components/History';
import { Statistics } from './components/Statistics';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomeScreen },
      { path: 'nuevo-tambo', Component: NewBatchForm },
      { path: 'tambos-activos', Component: ActiveBatches },
      { path: 'configuracion', Component: CheeseTypeConfig },
      { path: 'historial', Component: History },
      { path: 'estadisticas', Component: Statistics },
    ],
  },
]);
