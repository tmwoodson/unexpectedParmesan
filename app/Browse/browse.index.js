'use strict';
var React = require('react-native');
var Detail = require('./Detail/detail.index.js');
var Message = require('../Message/message.index.js');
var styles = require('./browse.styles.js');

var {
  Text,
  View,
  ListView,
  TouchableHighlight,
  ActivityIndicatorIOS,
  } = React;

class Browse extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2 }),
      loading: true, // loading animation property
      empty: false
    };
  } // end of constructor()


  _fetchQuests() {

    fetch(this.props.url) // assumes parent has passed in a quest url
      .then((response) => {
        if (response.status === 404) {
          this.setState({ empty: true });
          return [];
        } else {
          var result = response.json();
          return result;
        }
      })
      .then((responseData) => {
        if (!responseData.length) {
          this.setState( { empty: true });
        }
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseData),
          loading: false,
        });
      })
      .catch((error) => {
        console.log('The server has thrown an error: ', error);
      })
       .done();
  }

  // - After the scene is mounted, fetch relevant quests.
  // - Update this.state.dataSource API responseData
  // - Stop loading animation on success
  componentDidMount() {
    this._fetchQuests();
  } // end of componentWillMount()

  // Renders loading view while data is fetched from API
  renderLoading() {
    return (
      <ActivityIndicatorIOS
        color='#ED4519'
        animating={this.state.loading}
        style={[styles.centering, {height: 80}]}
        size="large" />
    );
  }

  renderError() {
    return (
      <Message message="Sorry, no quests match." />
    );
  }

  // Renders the list of quests retrieved from the API
  renderList() {
    return (
        <ListView
          style={styles.list}
          dataSource={this.state.dataSource}
          renderRow={this.renderQuest.bind(this)} />
    )
  }

  // Render each quest in the list
  renderQuest(quest) {
    var description = '';
    // If the quest is longer than 100 characters, show a portion of description and add ellipses
    if (quest.description && quest.description.length >= 95) {
      description = quest.description.substring(0, 95) + '...';
    } else if (quest.description) {
      description = quest.description;
    }

    // ensures that quests with 0 waypoints don't render
    if (!quest.waypoints.length) {
      return ( <View></View> );
    }

    // The onPress event will call the renderDetailView() function to render the Detail View for the quest
    return (
      <TouchableHighlight style={styles.item}
        onPress={this.renderDetailView.bind(this, quest)}
        underlayColor={'#FFFFFF'}>
        <View>
          <Text style={styles.title}>{quest.title}</Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.details}>
            {quest.waypoints.length} stops {quest.estimated_time ? '- ' + quest.estimated_time : ''}</Text>
          </View>
          <View>
            <Text style={styles.description}>
              {description}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    )
  } // end of renderQuest()

  // Renders the quest's Detail View
  renderDetailView(quest) {

    // render the scene with the navigator object to allow
    // the user to navigate back to the main ListView from the Detail View
    this.props.navigator.push({
      backButtonTitle: ' ',
      title: 'Quest Details',
      component: Detail,
      passProps: { details: quest, 
                   type: this.props.type, 
                   baseUrl: this.props.baseUrl, 
                   user: this.props.user, 
                   callback: this._fetchQuests.bind(this),
                   setCurrentQuest: this.props.setCurrentQuest,
                   setSelectedTab: this.props.setSelectedTab }
    }) // end of props.navigator.push()
  } // end of renderDetailView()

  render() {
    if (this.state.loading) {
      return this.renderLoading();
    } else if (!this.state.empty) {
      return this.renderList();
    } else {
      return this.renderError();
    }
  } // end of render()

} // end of Browse class

module.exports = Browse;
