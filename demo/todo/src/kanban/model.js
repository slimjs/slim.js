import { createState } from './modules/state.js';
import { eventBus } from './modules/messaging.js';

const bus = eventBus();

let uid = 0;

const ITEM_STATUS = {
  NEW: 'New',
  IN_PROGRESS: 'In-Progress',
  DONE: 'Done',
};

const list = (title = 'New List') => ({
  title,
  /** @type any[] */
  items: [],
});

const item = (title = 'New Item') => ({
  title,
  description: '',
  status: ITEM_STATUS.NEW,
  assignee: 'Unassigned',
  id: ++uid,
});

const board = {
  lists: [list('Backlog'), list('Development'), list('Test'), list('Deployed')],
};

board.lists[0].items = [
  item('Learn javascript'),
  item('Write javascript'),
  item('Enjoy javascript'),
];

const { state, on } = createState(board, bus);

export { ITEM_STATUS, list, item, state as board, on, bus };
