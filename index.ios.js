/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert

} from 'react-native';

import {
  StackNavigator,
} from 'react-navigation';


// Import Texts
import Amos from './data/torah/json/Amos.json';
import Deuteronomy from './data/torah/json/Deuteronomy.json';
import Exodus from './data/torah/json/Exodus.json';
import Ezekiel from './data/torah/json/Ezekiel.json';
import Genesis from './data/torah/json/Genesis.json';
import Hosea from './data/torah/json/Hosea.json';
import Isaiah from './data/torah/json/Isaiah.json';
import Jeremiah from './data/torah/json/Jeremiah.json';
import Joel from './data/torah/json/Joel.json';
import Joshua from './data/torah/json/Joshua.json';
import Judges from './data/torah/json/Judges.json';
import Kings_1 from './data/torah/json/Kings_1.json';
import Kings_2 from './data/torah/json/Kings_2.json';
import Leviticus from './data/torah/json/Leviticus.json';
import Malachi from './data/torah/json/Malachi.json';
import Micah from './data/torah/json/Micah.json';
import Numbers from './data/torah/json/Numbers.json';
import Obadiah from './data/torah/json/Obadiah.json';
import Samuel_1 from './data/torah/json/Samuel_1.json';
import Samuel_2 from './data/torah/json/Samuel_2.json';
import Zechariah from './data/torah/json/Zechariah.json';

// Import Translations
import GenesisTrans from './data/torah/translation/Genesis.json';
import ExodusTrans from './data/torah/translation/Exodus.json';
import DeuteronomyTrans from './data/torah/translation/Deuteronomy.json';
import LeviticusTrans from './data/torah/translation/Leviticus.json';
import NumbersTrans from './data/torah/translation/Numbers.json';



// Import the react-native-sound module
var Sound = require('react-native-sound');

// Enable playback in silence mode (iOS only)
Sound.setCategory('Playback');


const loadTorahReadingScreen = () => {
  Alert.alert('Button has been pressed!');
};

const loadThisWeeksTorahReading = () => {
  Alert.alert('Button has been pressed!');
};

const loadAboutPage = () => {
  Alert.alert('Button has been pressed!');
};


class CustomButton extends React.Component {
  render() {
    return (
      <TouchableOpacity onPress={this.props.doOnPress}>
        <Text style={styles.button}>
          {this.props.buttonTitle}
        </Text>
      </TouchableOpacity>
    );
  }
}

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Home',
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <ScrollView>
        <CustomButton doOnPress={() => navigate('TorahReadingsScreen')} buttonTitle="List of Torah Readings" />
        <CustomButton doOnPress={loadTorahReadingScreen} buttonTitle="This Week's Torah Readings" />
        <CustomButton doOnPress={() => navigate('About')} buttonTitle="About this App" />
      </ScrollView>
    );
  }
}

class AboutScreen extends React.Component {
  static navigationOptions = {
    title: 'About',
  };
  render() {
    return (
      <View>
        <Text>PocketTorah is a labor of love maintained by Russel Neiss & Charlie Schwartz.</Text>
        <Text>Initially funded by the Jewish New Media Innovation Fund, PocketTorah is designed to help you learn the weekly Torah and Haftarah portions anywhere, at any time, for free.</Text>
        <Text>If you like it, or find it useful, please consider making a donation to the Jewish charity of your choice.</Text>
      </View>
    );
  }
}

class TorahReadingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Torah Readings',
  };
  render() {
    //convert parshah json to array
    var aliyahData = require('./data/aliyah.json');
    var parshahArray = aliyahData.parshiot.parsha.map(x => x);

    //create button for each parsha
    var content = parshahArray.map((obj) => (<CustomButton doOnPress={() => navigate('AliyahSelectScreen', { parshah: obj._id, aliyot: obj.fullkriyah.aliyah, originatingBook: obj._verse.split(" ")[0] })} buttonTitle={obj._id} />) );

    const { params } = this.props.navigation.state;
    const { navigate } = this.props.navigation;
    return (
      <View>
        <ScrollView>
          {content}
        </ScrollView>
      </View>
    );
  }
}

class AliyahSelectScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.parshah}`,
  });
  render() {
    const { params } = this.props.navigation.state;
    const { navigate } = this.props.navigation;
    var content = params.aliyot.map((obj) => (<CustomButton doOnPress={() => navigate('PlayViewScreen', { parshah: obj._id, aliyotStart: obj._begin, aliyotEnd: obj._end, length: obj._numverses, title: params.parshah, originatingBook: params.originatingBook, aliyahNum: obj._num })} buttonTitle={obj._num !="M" ? "Aliyah "+obj._num+": "+obj._begin+"-"+obj._end : "Maftir Aliyah"+": "+obj._begin+"-"+obj._end} />) );

    return (
      <View>
        {content}
      </View>
    );
  }
}


class PlayViewScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.title}`,
  });
  constructor(props) {
    super(props);
    this.state = {
      audio: "",
    };
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    var audioFileName = "audio/"+params.title.replace(/[ ’]/g, '')+"-"+ params.aliyahNum+".mp3";
    var aliyahAudio = new Sound(audioFileName, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      this.setState({audio: aliyahAudio});
    });
  }

  componentWillUnmount() {
      this.state.audio.release();
  }
  render() {

    if (this.state.audio == "") {
    return (
      <View>
        <Text>Loading....</Text>
      </View>
    );

    }

    else {
      const {params} = this.props.navigation.state;
      var chapterStart = params.aliyotStart.split(':')[0];
      var verseStart = params.aliyotStart.split(':')[1];
      var chapterEnd = params.aliyotEnd.split(':')[0];
      var verseEnd = params.aliyotEnd.split(':')[1];
      var chapterStartIndex = chapterStart - 1;
      var verseStartIndex = verseStart - 1;
      var curWordIndex = 0;

      var bookText = (function(book) {
        switch (book) {
          case 'Amos':
            return Amos.Tanach.tanach.book;
          case 'Deuteronomy':
            return Deuteronomy.Tanach.tanach.book;
          case 'Exodus':
            return Exodus.Tanach.tanach.book;
          case 'Ezekiel':
            return Ezekiel.Tanach.tanach.book;
          case 'Genesis':
            return Genesis.Tanach.tanach.book;
          case 'GenesisTrans':
            return GenesisTrans;
          case 'ExodusTrans':
            return ExodusTrans;
          case 'DeuteronomyTrans':
            return DeuteronomyTrans;
          case 'LeviticusTrans':
            return LeviticusTrans;
          case 'NumbersTrans':
            return NumbersTrans;
          case 'Hosea':
            return Hosea.Tanach.tanach.book;
          case 'Isaiah':
            return Isaiah.Tanach.tanach.book;
          case 'Jeremiah':
            return Jeremiah.Tanach.tanach.book;
          case 'Joel':
            return Joel.Tanach.tanach.book;
          case 'Joshua':
            return Joshua.Tanach.tanach.book;
          case 'Judges':
            return Judges.Tanach.tanach.book;
          case 'Kings_1':
            return Kings_1.Tanach.tanach.book;
          case 'Kings_2':
            return Kings_2.Tanach.tanach.book;
          case 'Leviticus':
            return Leviticus.Tanach.tanach.book;
          case 'Malachi':
            return Malachi.Tanach.tanach.book;
          case 'Micah':
            return Micah.Tanach.tanach.book;
          case 'Numbers':
            return Numbers.Tanach.tanach.book;
          case 'Obadiah':
            return Obadiah.Tanach.tanach.book;
          case 'Samuel_1':
            return Samuel_1.Tanach.tanach.book;
          case 'Samuel_2':
            return Samuel_2.Tanach.tanach.book;
          case 'Zechariah':
            return Zechariah.Tanach.tanach.book;
        }
      });

      if (this.state.audio) {
        this.state.audio.play();
      }


      var verseWords = (function(verse) {
        var words = [];
        for (i = 0; i < verse.w.length; i++) {
          words.push(<TouchableOpacity key={i}><Text style={styles.word}>
            {verse.w[i].replace(/\//g, '')}
          </Text></TouchableOpacity>);
          curWordIndex++;
        }
        return words;
      });

      var verses = (function(book, transBook, chapterStart, verseStart, length) {
        var verseText = [];
        var curChapter = chapterStart;
        var curVerse = verseStart;
        for (q = 0; q < length; q++) {
          if (!book.c[curChapter].v[curVerse]) {
            curChapter = curChapter + 1;
            curVerse = 0;
          }
          verseText.push(<View style={styles.text}>
            <Text>{curChapter + 1}:{curVerse + 1}</Text>{verseWords(book.c[curChapter].v[curVerse])}
            <Text>{transBook.text[curChapter][curVerse]}</Text>
          </View>);
          curVerse = curVerse + 1;
        }

        return verseText;

      });


      var textFile = (function(book, sectionLength) {

        var selectedBook = bookText(book);
        var selectedTrans = bookText(book + "Trans");
//      var firstVerse = selectedBook.c[chapterStartIndex].v[verseStartIndex];

        var textToReturn = verses(selectedBook, selectedTrans, chapterStartIndex, verseStartIndex, sectionLength);

        return textToReturn;

      });


      return (
        <View>
          <ScrollView>
            <View style={styles.text}>{textFile(params.originatingBook, params.length)}</View>
          </ScrollView>
        </View>
      );
    }
  }
}


const PocketTorah = StackNavigator({
  Home: { screen: HomeScreen },
  About: { screen: AboutScreen },
  TorahReadingsScreen: { screen: TorahReadingsScreen },
  AliyahSelectScreen: { screen: AliyahSelectScreen },
  PlayViewScreen: { screen: PlayViewScreen },
});



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    top: 30,
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  button: {
    margin: 10,
    padding: 10,
    backgroundColor: '#ccc',
    textAlign: 'center',
  },

  text: {
    flexDirection:'row-reverse',
    flexWrap:'wrap',
    alignItems:'flex-start',
  },

  word: {
    flex:0,
    padding: 4,
    fontSize: 36,
    fontFamily: "Taamey Frank Taamim Fix",
  }

});

AppRegistry.registerComponent('PocketTorah', () => PocketTorah);