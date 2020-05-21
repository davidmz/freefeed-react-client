import React, { forwardRef, useMemo, useCallback, useEffect } from 'react';
import { useForm, useField } from 'react-final-form-hooks';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import {
  updateSubscriptionReset,
  subscribeWithHomeFeeds,
  createHomeFeed,
} from '../redux/action-creators';
import { initialAsyncState, withResponseHandler } from '../redux/async-helpers';
import { SUBSCRIBE, UPDATE_SUBSCRIPTION, SEND_SUBSCRIPTION_REQUEST } from '../redux/action-types';
import { CheckboxInput, CheckboxInputMulti } from './form-utils';
import { Throbber } from './throbber';

import menuStyles from './dropdown-menu.module.scss';
import styles from './user-subscription-edit-popup.module.scss';
import { Icon } from './fontawesome-icons';

function onSubmit(user, dispatch, subscrType) {
  return (values) => {
    const newListTitle = values.createNewList && values.newListTitle.trim();
    const { feeds } = values;
    const doSubscribe = () => dispatch(subscribeWithHomeFeeds(subscrType, user, feeds));
    if (newListTitle) {
      dispatch(
        withResponseHandler(
          createHomeFeed(newListTitle),
          ({ payload }) => (feeds.push(payload.timeline.id), doSubscribe()),
        ),
      );
    } else {
      doSubscribe();
    }
  };
}

export const UserSubscriptionEditPopup = forwardRef(function UserSubscriptionEditPopup(
  { username, homeFeeds, inHomeFeeds = [], closeForm, subscribe = false },
  ref,
) {
  const dispatch = useDispatch();
  const status = useSelector(
    (state) => state.updateUsersSubscriptionStates[username] || initialAsyncState,
  );
  const user = useSelector((state) =>
    Object.values(state.users).find((u) => u.username === username),
  );

  const sendRequest = subscribe && user.isPrivate === '1';

  const form = useForm(
    useMemo(
      () => ({
        initialValues: { feeds: inHomeFeeds, createNewList: false, newListTitle: '' },
        onSubmit: onSubmit(
          user,
          dispatch,
          sendRequest ? SEND_SUBSCRIPTION_REQUEST : subscribe ? SUBSCRIBE : UPDATE_SUBSCRIPTION,
        ),
      }),
      // Use only the initial inHomeFeeds value
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [user, dispatch, subscribe, sendRequest],
    ),
  );

  const feeds = useField('feeds', form.form);
  const createNewList = useField('createNewList', form.form);
  const newListTitle = useField('newListTitle', form.form);

  const onNewListFocus = useCallback(
    ({ type, target }) => {
      if (type === 'focus') {
        form.form.change('createNewList', true);
      } else if (type === 'blur' && target.value.trim() === '') {
        form.form.change('createNewList', false);
      }
    },
    [form],
  );

  useEffect(() => {
    if (!status.success) {
      return;
    }
    closeForm();
    dispatch(updateSubscriptionReset(username));
  }, [status.success, closeForm, dispatch, username]);

  const buttonText = useMemo(
    () =>
      sendRequest
        ? status.loading
          ? 'Sending request…'
          : 'Send request'
        : subscribe
        ? status.loading
          ? 'Subscribing…'
          : 'Subscribe'
        : status.loading
        ? 'Updating…'
        : 'Update',
    [subscribe, sendRequest, status.loading],
  );

  return (
    <div ref={ref} className={cn(menuStyles.list, styles.popup)}>
      <form onSubmit={form.handleSubmit} onReset={closeForm}>
        {homeFeeds.map((h) => (
          <div className="checkbox" key={h.id}>
            <label>
              <CheckboxInputMulti field={feeds} value={h.id} /> {h.title}
            </label>
          </div>
        ))}
        <div className="checkbox">
          <label>
            <CheckboxInput field={createNewList} />
            <input
              type="text"
              className="form-control input-sm"
              {...newListTitle.input}
              placeholder="Create a new list"
              onFocus={onNewListFocus}
              onBlur={onNewListFocus}
            />
          </label>
        </div>
        <div className="form-group">
          <button
            className={cn('btn btn-primary btn-sm', { disabled: status.loading })}
            type="submit"
          >
            {buttonText}
          </button>
          <button className="btn btn-link btn-sm" type="reset">
            Cancel
          </button>
          {status.loading && <Throbber />}
        </div>
        {status.error && (
          <p className="text-danger" role="alert">
            <Icon icon={faExclamationTriangle} /> {status.errorText}
          </p>
        )}
      </form>
    </div>
  );
});
