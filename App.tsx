import React, { useRef, useState } from 'react';
import { View, StyleSheet,} from 'react-native';

import {  GestureHandlerRootView } from 'react-native-gesture-handler';
import { SelectableItem } from './src/components/SelectableItems';


export default function App() {

  /** Array of items with selection state */
  const [items, setItems] = useState(
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      chipSelected: false, // Tracks if this item's chip is selected
    }))
  );
  
  /** References to each SelectableItem for imperative control */
  const itemRefs = useRef<Array<{ deselectAll: () => void } | null>>([]);
  
  const setItemSelected = (index: number, isSelected: boolean) => {
    setItems(prevItems => 
      prevItems.map((prevItem, idx) => 
        idx === index 
          ? { ...prevItem, chipSelected: isSelected }
          : prevItem
      )
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}> 
      <View style={styles.screen}>
        <View style={styles.col}>
          {items.map((item, index) => (
            <SelectableItem
              key={item.id}
              showChip={item.chipSelected}
              onChipPress={(isSelected) => {
                // Update the specific item's chip selection state
                setItemSelected(index, isSelected);
              }}
              chipText="Clients"
              ref={el => itemRefs.current[index] = el}
            />
          ))}
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  /** Main app container */
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  col: {
    width: '100%',
    alignItems: 'center',
    gap: 40, // Generous spacing between items
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
 

});