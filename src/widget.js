import cls from 'classnames';
import Comment from './comment';
import Form from './form';
import s from './style.css';
import { actions } from './actions';
import { Connect } from 'redux-zero/preact';
import { h, render, Component } from 'preact';
import { Recaptcha } from './recaptcha';
import { __ } from './i18n';
import { commentCount } from './comment-utils';

export default () => (
  <Connect mapToProps={mapToProps} actions={actions}>
    {(props) => <Widget {...props} />}
  </Connect>
);

const mapToProps = ({ config, forms, loading, cursor, comments }) => {
  const {
    disableSocialLogin,
    disableAnonymousLogin,
    disableLoadMore,
    sort,
    hideAttribution,
    recaptchaSitekey,
    hideCommentHeader,
    hideNoCommentsText,
  } = config;
  const shouldRenderForm = !(disableSocialLogin && disableAnonymousLogin);
  const hasMore = !!cursor;
  const count = commentCount(comments);
  const countText = count > 0 ? ` (${count}${hasMore ? '+' : ''})` : ``;

  return {
    comments,
    count,
    countText,
    cursor,
    disableLoadMore,
    forms,
    hideAttribution,
    hideCommentHeader,
    hideNoCommentsText,
    loading,
    recaptchaSitekey,
    shouldRenderForm,
    sort,
  };
};

class Widget extends Component {
  loadMore = () => {
    this.props.loadComments();
  };

  componentDidMount() {
    this.props.loadComments();
  }

  componentDidUpdate() {
    this.props.tryJumpToComment();
  }

  render({
    comments,
    count,
    countText,
    cursor,
    disableLoadMore,
    forms,
    hideAttribution,
    hideCommentHeader,
    hideNoCommentsText,
    loading,
    onSortChange,
    recaptchaSitekey,
    setRecaptchaRef,
    shouldRenderForm,
    sort,
  }) {
    return (
      <div className={s.widget}>
        {!hideCommentHeader && (
          <div className={cls(s.header)}>
            <span className={cls(s.fontHeading1)}>
              {__('comments')}
              {countText}
            </span>
            <span className={cls(s.fontBody2)}>
              Show:{' '}
              <select
                onChange={onSortChange}
                className={cls(s.select, s.fontBody2)}
              >
                <option value="desc" selected={sort === 'desc'}>
                  {__('newestFirst')}
                </option>
                <option value="asc" selected={sort === 'asc'}>
                  {__('oldestFirst')}
                </option>
                <option value="top" selected={sort === 'top'}>
                  {__('topFirst')}
                </option>
              </select>
            </span>
          </div>
        )}
        {shouldRenderForm && <Form form={forms[0]} formIdx={0} />}
        <div className={s.noComments}>
          {loading && <div className={s.loading}>{__('loadingComments')}</div>}
          {!loading && count === 0 && !hideNoCommentsText && (
            <p className={cls(s.text, s.fontBody2)}>{__('noComments')}</p>
          )}
        </div>
        {comments
          .filter((c) => !c.hidden)
          .map((c) => (
            <Comment comment={c} level={0} />
          ))}
        {cursor && !disableLoadMore && (
          <div className={s.loadMore}>
            <button
              onClick={this.loadMore}
              className={cls(s.btn, s.primary, s.large, s.fontButton1)}
            >
              {__('loadMoreButton')}
            </button>
          </div>
        )}
        {recaptchaSitekey && (
          <Recaptcha
            sitekey={recaptchaSitekey}
            ref={(c) => setRecaptchaRef(c)}
          />
        )}
        {shouldRenderForm && comments.length > 10 && (
          <Form form={forms[1]} formIdx={1} last={true} />
        )}
        {!hideAttribution && (
          <div className={cls(s.attribution, s.fontBody3)}>
            <span>powered by &nbsp;</span>
            <a href="https://just-comments.com" target="_blank">
              just-comments.com
            </a>
          </div>
        )}
      </div>
    );
  }
}
