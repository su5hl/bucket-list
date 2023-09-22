import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';

export default function App() {
  // 주석 처리된 데이터
  const tmp = {
    1: { id: '1', text: 'a', completed: false },
    2: { id: '2', text: 'b', completed: true },
    3: { id: '3', text: 'c', completed: false },
  };

  const [title] = useState('버킷 리스트');
  const [inputText, setInputText] = useState('');
  const [items, setItems] = useState(Object.values(tmp)); // 초기 데이터로 tmp 객체를 사용합니다.
  const [editIndex, setEditIndex] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);
  const [editItemText, setEditItemText] = useState('');
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

   const deleteItem = (index) => {
    if (editIndex === index) {
      // 수정 중인 항목이면 수정 취소하고 삭제
      setEditIndex(null);
    } else {
      // 수정 중이 아니면 삭제
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
      saveItems(updatedItems); // 삭제 후 데이터 저장
    }
  };
  



const loadItems = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('items');
    if (jsonValue !== null) {
      const loadedItems = JSON.parse(jsonValue);
      setItems(loadedItems);
    }
  } catch (error) {
    console.error('데이터 불러오기 오류:', error);
  }
};
// AsyncStorage에서 데이터 불러오기
  useEffect(() => {
    async function loadItems() {
      try {
        const savedItems = await AsyncStorage.getItem('items');
        if (savedItems !== null) {
          setItems(JSON.parse(savedItems));
        }
      } catch (error) {
        console.error('데이터 불러오기 오류:', error);
      }
    }
    loadItems();
  }, []);
  
// 항목 데이터 저장 함수
const saveItems = async (updatedItems) => {
  try {
    const jsonValue = JSON.stringify(updatedItems);
    await AsyncStorage.setItem('items', jsonValue);
  } catch (error) {
    console.error('데이터 저장 오류:', error);
  }
};
 // AsyncStorage에 데이터 저장하기
  useEffect(() => {
    async function saveItems() {
      try {
        await AsyncStorage.setItem('items', JSON.stringify(items));
      } catch (error) {
        console.error('데이터 저장 오류:', error);
      }
    }
    saveItems();
  }, [items]);
  
  const startEditItem = (index) => {
    setEditIndex(index);
    setEditItemText(items[index].text); // 수정 중인 항목의 텍스트 설정
  };

  const saveEditItem = (index, newText) => {
    const updatedItems = [...items];
    updatedItems[index].text = newText;
    setItems(updatedItems);
    setEditIndex(null); // 저장 버튼을 누를 때만 수정 모드 종료
  };

  const completeItem = (index) => {
    const updatedItems = [...items];
    updatedItems[index].completed = true;
    setItems(updatedItems);

    const completedItem = items[index].text;
    setCompletedItems([...completedItems, completedItem]);
  };

  const addItem = () => {
    if (inputText.trim() !== '') {
      setItems([...items, { text: inputText, completed: false }]);
      setInputText('');
    }
  };
const handleEditModeDismiss = () => {
  setEditIndex(null); // 수정 모드 종료
};
  const toggleCompleteItem = (index) => {
    const updatedItems = [...items];
    updatedItems[index].completed = !updatedItems[index].completed;
    setItems(updatedItems);
  };
   const toggleDeleteModal = () => {
    setDeleteModalVisible(!isDeleteModalVisible);
  };
const confirmDeleteCompletedItems = () => {
    // 여기에서 완료된 항목을 삭제하는 로직을 구현
    const updatedItems = items.filter((item) => !item.completed);
    setCompletedItems([]);
    setItems(updatedItems);
    toggleDeleteModal(); // 모달 닫기
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TextInput
        style={styles.input}
        placeholder="     항목추가"
         placeholderTextColor="blue"
        onChangeText={(text) => setInputText(text)}
        value={inputText}
        onSubmitEditing={addItem}
      />

      <FlatList
       onTouchStart={handleEditModeDismiss} // FlatList 외부 터치 시 수정 모드 종료
        data={items}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
  <TouchableOpacity onPress={() => toggleCompleteItem(index)}>
    <Text style={item.completed ? styles.completeIcon : styles.incompleteIcon}>
      {item.completed ? '✅' : '◻️'}
    </Text>
  </TouchableOpacity>
  {editIndex === index ? (
    <>
      <TextInput
        style={styles.editInput}
        onChangeText={(text) => setEditItemText(text)}
        value={editItemText}
        autoFocus={true}
        onSubmitEditing={() => {
          saveEditItem(index, editItemText); // 엔터를 눌렀을 때 저장 함수 호출
        }}
      />
      <Button title="저장" onPress={() => saveEditItem(index, editItemText)} />
    </>
  ) : (
    <>
      {!item.completed && (
        <Button title="" onPress={() => completeItem(index)} />
      )}
      <Text style={item.completed ? styles.completedItem : null}>{item.text}</Text>
      {!item.completed && (
        <TouchableOpacity style={styles.flexEnd}>
        <Button  title="수정" onPress={() => startEditItem(index)} /></TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => deleteItem(index)} style={styles.flexEnd}>
        <Text style={styles.deleteButton}>삭제</Text>
      </TouchableOpacity>
    </>
  )}
</View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
        <Button style={styles.bottom1} title="완료항목 전체삭제" onPress={toggleDeleteModal} />

      {/* 삭제 확인 모달 */}
      <Modal isVisible={isDeleteModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>삭제하시겠습니까?</Text>
          <Button title="확인" onPress={confirmDeleteCompletedItems} />
          <Button title="취소" onPress={toggleDeleteModal} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  title: {
    fontSize: 50,
    marginBottom: 10,
    marginTop: 70,
  },
  input: {
    width: '100%',
    padding: 20,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10, 
    fontSize:30,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    minWidth: '90%',
    maxWidth: '100%',
  },
  editInput: {
    flex: 1,
    padding: 5,
    marginRight: 10,
    borderColor: 'gray',
    borderWidth: 1,
    minWidth: 50,
  },
  deleteButton: {
    color: 'red',
  },
  completedItem: {
    // textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 16,
  },
   modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  bottom1:{
    fontSize:100,
  },
  flexEnd: {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
},

});
