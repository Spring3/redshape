import React from 'react';
import renderer from 'react-test-renderer';
import Table from '../Table';

describe('Table component', () => {
  it('should match the snapshot', () => {
    const tree = renderer.create(
      <Table>
        <tr>
          <th>Name</th>
          <th>Surname</th>
        </tr>
        <tr>
          <td>Van</td>
          <td>Helsing</td>
        </tr>
        <tr>
          <td>Pewdie</td>
          <td>Pie</td>
        </tr>
      </Table>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
