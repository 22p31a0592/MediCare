import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';

class StepCounterService {
  subscription = null;
  steps = 0;

  async start(callback) {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      console.log('❌ Pedometer not available');
      return;
    }

    this.subscription = Pedometer.watchStepCount(result => {
      this.steps = result.steps;
      AsyncStorage.setItem('steps', this.steps.toString());
      callback?.(this.steps);
    });
  }

  stop() {
    this.subscription?.remove();
    this.subscription = null;
  }

  async loadSaved() {
    const saved = await AsyncStorage.getItem('steps');
    this.steps = saved ? parseInt(saved) : 0;
    return this.steps;
  }
}

export default new StepCounterService();
