import 'jest-styled-components';
import 'jest-dom/extend-expect';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

global.fetch = require('jest-fetch-mock');

configure({ adapter: new Adapter() });
