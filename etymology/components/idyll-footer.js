
const React = require('react');

class Logo extends React.Component {
  render() {
    return (
      <p>
        <br/>
        <i>
          This document was created with <a href="https://idyll-lang.github.io/idyll/">Idyll</a>,
          a new markup language for creating interactive documents.
          See the <a href={this.props.markupUrl}>markup used to create this page</a>.
        </i>
      </p>
    );
  }
}

module.exports = Logo;
