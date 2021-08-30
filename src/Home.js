import React, { Component } from 'react'

class Home extends Component {

  render() {
    return (
      <div id="content">
        <form onSubmit={(event) => {
          event.preventDefault()
          this.props.createPoll(this.poll.value)
        }}>
          <input id="newPoll" ref={(input) => this.poll = input} type="text" className="form-control" placeholder="New poll question..." required />
          <input type="submit" />
        </form>
        <ul id="pollList" className="list-unstyled">
          { this.props.polls.map((poll, key) => {
            return(
                <li  key={poll.id} className="pollRow">
                  "<i>{poll.question}</i>" created by <b>{poll.creator}</b>
                </li>
              )
          })}
        </ul>
      </div>
    );
  }
}

export default Home;