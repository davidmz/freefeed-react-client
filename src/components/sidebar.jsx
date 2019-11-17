import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import format from 'date-fns/format';

import { preventDefault } from '../utils';
import { setUserColorScheme } from '../redux/action-creators';
import {
  SCHEME_DARK,
  SCHEME_SYSTEM,
  SCHEME_LIGHT,
  systemColorSchemeSupported,
} from '../services/appearance';
import UserName from './user-name';
import RecentGroups from './recent-groups';
import ErrorBoundary from './error-boundary';
import { InvisibleSelect } from './invisibe-select';

const LoggedInBlock = ({ user, signOut }) => (
  <div className="logged-in">
    <div className="avatar">
      <Link to={`/${user.username}`}>
        <img src={user.profilePictureMediumUrl} width="50" height="50" />
      </Link>
    </div>

    <div className="user">
      <div className="author">
        <UserName user={user}>{user.screenName}</UserName>
      </div>
      <div>
        <Link to="/settings">settings</Link>
        &nbsp;-&nbsp;
        <a onClick={preventDefault(signOut)}>sign out</a>
      </div>
    </div>
  </div>
);

const SideBarFriends = ({ user }) => (
  <div className="box">
    <div className="box-header-friends">Friends</div>
    <div className="box-body">
      <ul>
        <li className="p-home">
          <Link to="/">Home</Link>
        </li>
        <li className="p-direct-messages">
          <Link
            to="/filter/direct"
            style={user.unreadDirectsNumber > 0 ? { fontWeight: 'bold' } : {}}
          >
            Direct messages {user.unreadDirectsNumber > 0 ? `(${user.unreadDirectsNumber})` : ''}
          </Link>
        </li>
        <li className="p-my-discussions">
          <Link to="/filter/discussions">My discussions</Link>
        </li>
        <li className="p-saved-posts">
          <Link to="/filter/saves">Saved posts</Link>
        </li>
        <li className="p-best-of">
          <Link to="/summary/1">Best of the day</Link>
        </li>
        <li className="p-home">
          <Link
            to="/filter/notifications"
            style={
              user.unreadNotificationsNumber > 0 &&
              !user.frontendPreferences.hideUnreadNotifications
                ? { fontWeight: 'bold' }
                : {}
            }
          >
            Notifications{' '}
            {user.unreadNotificationsNumber > 0 && !user.frontendPreferences.hideUnreadNotifications
              ? `(${user.unreadNotificationsNumber})`
              : ''}
          </Link>
        </li>
        <li className="p-invites">
          <Link to="/invite">Invite</Link>
        </li>
      </ul>
    </div>
    <div className="box-footer">
      <Link to={`/friends`}>Browse/edit friends</Link>
    </div>
  </div>
);

const SideBarFreeFeed = () => (
  <div className="box">
    <div className="box-header-freefeed">FreeFeed</div>
    <div className="box-body">
      <ul>
        <li>
          <Link to="/search">Search</Link>
        </li>
        <li>
          <Link to="/filter/everything">Everything</Link>
        </li>
        <li>
          <Link to="/all-groups">Public groups</Link>
        </li>
        <li>
          <Link to="/support">Support</Link> /{' '}
          <a href="https://github.com/FreeFeed/freefeed-server/wiki/FAQ" target="_blank">
            FAQ
          </a>
        </li>
        <li>
          <Link to="/freefeed">News</Link>
        </li>
        <li>
          <Link to="/about/donate">Donate</Link>
        </li>
      </ul>
    </div>
  </div>
);

const SideBarMemories = () => {
  const today = new Date();
  const todayString = format(today, 'MMdd');
  const todayYear = today.getFullYear();
  const yearLinks = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12]].map((years, index) => (
    <div className="years-row" key={index}>
      {years.map((offset) => {
        const linkYear = todayYear - offset;
        return (
          <Link key={`link-${offset}`} to={`/memories/${linkYear}${todayString}`}>
            {linkYear}
          </Link>
        );
      })}
    </div>
  ));
  return (
    <div className="box">
      <div className="box-header-memories">Memories of {format(today, 'MMMM d')}</div>
      <div className="box-body">
        <div className="year-links-row">{yearLinks}</div>
      </div>
    </div>
  );
};

const SideBarGroups = ({ recentGroups }) => (
  <div className="box">
    <div className="box-header-groups">Groups</div>
    <div className="box-body">
      <RecentGroups recentGroups={recentGroups} />
    </div>
    <div className="box-footer">
      <Link to="/groups">Browse/edit groups</Link>
    </div>
  </div>
);

const handleOnetimeDonationClick = () => {
  document.forms['singlePayPalPayment'].submit();
};

const SideBarCoinJar = () => (
  <div className="box">
    <div className="box-header-groups">Donate</div>
    <div className="box-footer">
      <p style={{ marginBottom: '10px' }}>
        <Link to="/about/donate">
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Donate</span>
        </Link>{' '}
        to FreeFeed! Your regular donations pay for hosting and keep FreeFeed running.
      </p>
      <p style={{ marginBottom: '10px' }}>
        Make a{' '}
        <span
          onClick={handleOnetimeDonationClick}
          style={{ textDecoration: 'underline', cursor: 'pointer' }}
        >
          one-time PayPal donation&nbsp;→
        </span>
      </p>
      <span style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
          <input type="hidden" name="cmd" value="_s-xclick" />
          <input type="hidden" name="hosted_button_id" value="DRR5XU73QLD7Y" />
          <table>
            <tbody>
              <tr>
                <td style={{ paddingBottom: '5px' }}>
                  <input
                    type="hidden"
                    name="on0"
                    value="Pick monthly donation amount"
                    style={{ padding: '5px 0' }}
                  />
                  Choose your option:
                </td>
              </tr>
              <tr>
                <td>
                  <select name="os0" defaultValue="Advanced">
                    <option value="Basic">€5.00 EUR / month</option>
                    <option value="Advanced">€10.00 EUR / month</option>
                    <option value="Sizable">€15.00 EUR / month</option>
                    <option value="Luxurious">€20.00 EUR / month</option>
                    <option value="King size">€30.00 EUR / month</option>
                    <option value="Master of the Universe">€50.00 EUR / month</option>
                    <option value="Chuck Norris">€75.00 EUR / month</option>
                    <option value="Duke Nukem">€100.00 EUR / month</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <input type="hidden" name="currency_code" value="EUR" />
          <input
            type="image"
            src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png"
            name="submit"
            alt="PayPal - The safer, easier way to pay online!"
            style={{ margin: '5px' }}
          />
          <img
            alt=""
            src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif"
            width="1"
            height="1"
            style={{ display: 'none !important' }}
          />
        </form>
      </span>
      <form
        action="https://www.paypal.com/cgi-bin/webscr"
        method="post"
        target="_top"
        id="singlePayPalPayment"
      >
        <input type="hidden" name="cmd" value="_s-xclick" />
        <input type="hidden" name="hosted_button_id" value="HMVYD6GEWNWH8" />
        <input
          type="image"
          src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png"
          width="0"
          height="0"
          name="submit"
          alt="PayPal - The safer, easier way to pay online!"
        />
        <img
          alt=""
          src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif"
          width="1"
          height="1"
          style={{ display: 'none !important' }}
        />
      </form>
      <p style={{ marginBottom: '10px' }}>
        Donate via{' '}
        <a href="https://yasobe.ru/na/freefeed" target="_blank">
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>
            Yandex.Money&nbsp;→
          </span>
        </a>
      </p>
    </div>
  </div>
);

const doNothing = preventDefault(() => false);

const SideBarBookmarklet = () => (
  <div className="box">
    <div className="box-header-groups">Bookmarklet</div>
    <div className="box-footer">
      Once added to your toolbar, this button will let you share web pages on FreeFeed. You can even
      attach thumbnails of images from the page you share!
    </div>
    <div className="box-footer">
      Click and drag{' '}
      <a className="bookmarklet-button" href="BOOKMARKLET_PLACEHOLDER" onClick={doNothing}>
        Share on FreeFeed
      </a>{' '}
      to&nbsp;your toolbar.
    </div>
    <div className="box-footer">
      There is also a{' '}
      <a href="https://chrome.google.com/webstore/detail/share-on-freefeed/dngijpbccpnbjlpjomjmlppfgmnnilah">
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Chrome Extension</span>
      </a>{' '}
      for sharing on FreeFeed.
    </div>
  </div>
);

const SideBarArchive = ({ user }) => {
  if (!user || !user.privateMeta) {
    return null;
  }
  const { archives } = user.privateMeta;
  if (
    !user ||
    !user.privateMeta ||
    !archives ||
    (archives.recovery_status === 2 && archives.restore_comments_and_likes)
  ) {
    return null;
  }
  return (
    <div className="box">
      <div className="box-header-groups">FriendFeed.com Archives</div>
      <div className="box-body">
        <ul>
          <li>
            <Link to="/settings/archive">Restore your archive!</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

const SideBarAppearance = connect(
  ({ userColorScheme }) => ({ userColorScheme }),
  (dispatch) => ({ onChange: (e) => dispatch(setUserColorScheme(e.target.value)) }),
)(({ userColorScheme, onChange }) => {
  let value = userColorScheme;
  if (!systemColorSchemeSupported && value === SCHEME_SYSTEM) {
    value = SCHEME_LIGHT;
  }
  return (
    <div className="box">
      <div className="box-header-groups">Appearance</div>
      <div className="box-body">
        <ul>
          <li>
            <div>
              Color Scheme:{' '}
              <InvisibleSelect value={value} onChange={onChange} className="color-scheme-selector">
                <option value={SCHEME_LIGHT}>Light</option>
                {systemColorSchemeSupported && <option value={SCHEME_SYSTEM}>Auto</option>}
                <option value={SCHEME_DARK}>Dark</option>
              </InvisibleSelect>{' '}
              <span className="color-scheme-hint">
                {value === SCHEME_LIGHT
                  ? 'default'
                  : value === SCHEME_SYSTEM
                  ? 'as in your OS'
                  : null}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
});

const SideBar = ({ user, signOut, recentGroups }) => {
  return (
    <div className="col-md-3 sidebar">
      <ErrorBoundary>
        <LoggedInBlock user={user} signOut={signOut} />
        <SideBarFriends user={user} />
        <SideBarArchive user={user} />
        <SideBarFreeFeed />
        <SideBarGroups recentGroups={recentGroups} />
        <SideBarBookmarklet />
        <SideBarMemories />
        <SideBarCoinJar />
        <SideBarAppearance />
      </ErrorBoundary>
    </div>
  );
};

export default SideBar;
