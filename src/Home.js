import React, { Component } from 'react'

class Home extends Component {

  render() {
    return (
      <div id="content">
        <form onSubmit={(event) => {
          event.preventDefault()
          this.props.createPoll(this.poll.value)
        }}>
          <div class="input-group mb-3">
            <input id="newPoll" aria-describedby="pollSubmit" type="text" className="form-control" placeholder="New poll question..." required ref={(input) => this.poll = input}/>
            <input id="pollSubmit" class="btn btn-outline-secondary" type="submit" value="Create poll"/>
          </div>
        </form>
        <ul id="pollList" class="list-group mb-5">
          { this.props.polls.map((poll, key) => {
            return(
                <li  key={poll.id} class="list-group-item list-group-numbered">
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