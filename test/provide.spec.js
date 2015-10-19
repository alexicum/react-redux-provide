import './init';
import expect from 'expect';
import React, { PropTypes } from 'react';
import { Simulate } from 'react-addons-test-utils';
import { renderTest } from 'react-redux-provide-test-utils';
import Test from './components/Test';
import TestItem from './components/TestItem';

function render (props) {
  return renderTest(Test, props);
}

function renderItem (props) {
  return renderTest(TestItem, props);
}

const placeholder = 'Testing...';

describe('provide', () => {
  it('should have the correct displayName', () => {
    expect(Test.displayName).toBe('ProvideTest(list)');
  });

  it('should assign propTypes to the component class', () => {
    expect(Test.WrappedComponent.propTypes.list).toBeTruthy();
    expect(Test.WrappedComponent.propTypes.createItem).toBeTruthy();
  });

  it('should render correctly using assigned initialState', () => {
    const { node } = render({ placeholder });
    const input = node.childNodes[0];
    const firstItem = node.childNodes[1];

    expect(node.tagName).toBe('DIV');
    expect(node.className).toBe('test');

    expect(node.childNodes.length).toBe(2);

    expect(input.tagName).toBe('INPUT');
    expect(input.getAttribute('placeholder')).toBe(placeholder);

    expect(firstItem.tagName).toBe('LI');
    expect(firstItem.className).toBe('test-item');
    expect(firstItem.textContent).toBe('test');
  });

  it('should ignore undefined propTypes', () => {
    const stuff = 'things';
    const index = 0;
    const { wrappedInstance } = render({ placeholder, stuff, index });

    expect(wrappedInstance.props.placeholder).toBe(placeholder);
    expect(wrappedInstance.props.stuff).toBe(undefined);
    expect(wrappedInstance.props.index).toBe(undefined);

    expect(wrappedInstance.props.setList).toBe(undefined);
    expect(wrappedInstance.props.mapList).toBe(undefined);
    expect(wrappedInstance.props.filterList).toBe(undefined);
    expect(wrappedInstance.props.createItem).toBeTruthy();
    expect(wrappedInstance.props.updateItem).toBe(undefined);
    expect(wrappedInstance.props.deleteitem).toBe(undefined);
    expect(wrappedInstance.props.item).toBe(undefined);
    expect(wrappedInstance.props.list).toBeTruthy();
  });

  it('should trigger an action and update the view', () => {
    const { node, wrappedInstance } = render({ placeholder });
    const { createItem } = wrappedInstance;
    const spy = expect.spyOn(wrappedInstance, 'createItem');
    const input = node.childNodes[0];

    input.value = 'another test';

    Simulate.keyDown(input);
    expect(spy.calls.length).toBe(0);

    Simulate.keyDown(input, { key: 'Enter' });
    expect(spy.calls.length).toBe(1);

    createItem.call(wrappedInstance);
    expect(wrappedInstance.props.list.length).toBe(2);
    expect(node.childNodes.length).toBe(3);
    expect(node.childNodes[1].textContent).toBe(input.value);
    expect(node.childNodes[2].textContent).toBe('test');
  });

  it('should act as a single source of truth for all instances', () => {
    const test = render({ placeholder });
    const testItem = renderItem({ index: 0 });
    const value = 'testing update...';

    testItem.wrappedInstance.update(value);

    expect(test.node.childNodes.length).toBe(3);
    expect(test.wrappedInstance.props.list.length).toBe(2);

    expect(test.wrappedInstance.props.list[0].value).toBe(value);
    expect(test.wrappedInstance.props.list[0].updated).toBe(true);
    expect(testItem.wrappedInstance.props.item.value).toBe(value);
    expect(testItem.wrappedInstance.props.item.updated).toBe(true);

    expect(test.node.childNodes.length).toBe(3);
    expect(test.node.childNodes[1].textContent).toBe(value);
    expect(testItem.node.textContent).toBe(value);
  });
});
