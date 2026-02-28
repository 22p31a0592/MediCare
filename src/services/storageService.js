import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
  /**
   * Get user data from storage
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getUser() {
    try {
      const userData = await AsyncStorage.getItem('meditrack_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },
  
  /**
   * Save user data to storage
   * @param {Object} userData - User object containing name and createdAt
   */
  async setUser(userData) {
    try {
      await AsyncStorage.setItem('meditrack_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },
  
  /**
   * Get all pills from storage
   * @returns {Promise<Array>} Array of pill objects
   */
  async getPills() {
    try {
      const pillsData = await AsyncStorage.getItem('meditrack_pills');
      return pillsData ? JSON.parse(pillsData) : [];
    } catch (error) {
      console.error('Error getting pills:', error);
      return [];
    }
  },
  
  /**
   * Save pills array to storage
   * @param {Array} pills - Array of pill objects
   */
  async setPills(pills) {
    try {
      await AsyncStorage.setItem('meditrack_pills', JSON.stringify(pills));
    } catch (error) {
      console.error('Error saving pills:', error);
    }
  },
  
  /**
   * Add a new pill to storage
   * @param {Object} pillData - Pill object without _id and createdAt
   * @returns {Promise<Object|null>} New pill object with _id and createdAt
   */
  async addPill(pillData) {
    try {
      const pills = await this.getPills();
      const newPill = {
        ...pillData,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      pills.push(newPill);
      await this.setPills(pills);
      return newPill;
    } catch (error) {
      console.error('Error adding pill:', error);
      return null;
    }
  },
  
  /**
   * Delete a pill by ID
   * @param {string} pillId - ID of pill to delete
   */
  async deletePill(pillId) {
    try {
      const pills = await this.getPills();
      const filtered = pills.filter(p => p._id !== pillId);
      await this.setPills(filtered);
    } catch (error) {
      console.error('Error deleting pill:', error);
    }
  },

  /**
   * Mark pill as taken for today
   * @param {string} pillId - ID of pill to mark as taken
   * @returns {Promise<Object|null>} Updated pill object
   */
  async markPillAsTaken(pillId) {
    try {
      const pills = await this.getPills();
      const updatedPills = pills.map(pill => {
        if (pill._id === pillId) {
          return {
            ...pill,
            lastTaken: new Date().toISOString(),
            daysCompleted: (pill.daysCompleted || 0) + 1,
          };
        }
        return pill;
      });
      
      await this.setPills(updatedPills);
      const updatedPill = updatedPills.find(p => p._id === pillId);
      return updatedPill || null;
    } catch (error) {
      console.error('Error marking pill as taken:', error);
      return null;
    }
  },

  /**
   * Reset daily taken status (called at midnight)
   */
  async resetDailyStatus() {
    try {
      const lastReset = await AsyncStorage.getItem('last_daily_reset');
      const today = new Date().toDateString();
      
      if (lastReset !== today) {
        // Reset logic if needed (currently pills track by date)
        await AsyncStorage.setItem('last_daily_reset', today);
        console.log('✅ Daily status reset');
      }
    } catch (error) {
      console.error('Error resetting daily status:', error);
    }
  },

  /**
   * Save AI recommendations
   * @param {Object} recommendations - AI generated recommendations
   */
  async saveAIRecommendations(recommendations) {
    try {
      const data = {
        ...recommendations,
        savedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('meditrack_ai_recommendations', JSON.stringify(data));
      console.log('✅ AI recommendations saved');
    } catch (error) {
      console.error('Error saving AI recommendations:', error);
    }
  },

  /**
   * Get AI recommendations
   * @returns {Promise<Object|null>} AI recommendations or null
   */
  async getAIRecommendations() {
    try {
      const data = await AsyncStorage.getItem('meditrack_ai_recommendations');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return null;
    }
  },

  /**
   * Clear AI recommendations
   */
  async clearAIRecommendations() {
    try {
      await AsyncStorage.removeItem('meditrack_ai_recommendations');
      console.log('✅ AI recommendations cleared');
    } catch (error) {
      console.error('Error clearing AI recommendations:', error);
    }
  },
  
  /**
   * Clear all app data (user, pills, and AI recommendations)
   * Used for reset functionality
   */
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        'meditrack_user', 
        'meditrack_pills',
        'meditrack_ai_recommendations',
        'last_daily_reset',
      ]);
      console.log('✅ All data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
};

export default storageService;