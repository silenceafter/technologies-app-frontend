import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectSearch } from './headerSlice';
import { method } from 'lodash';

const initialState = {
  items: [],
  itemsDetails: [],
  loading: false,
  error: null,
  limit: 50,
  page: 1,
  hasMore: true,
};

//загрузка списка изделий (корневые элементы)
export const fetchData = createAsyncThunk(
  'drawingsAllTree/fetchData',
  async ({ limit, page }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      //const { limit, page } = state.drawingsAllTree;
      const search = selectSearch(state);
      //
      const response = await fetch(`http://localhost/Ivc/Ogt/ExecuteScripts/CreateDataTree.v0.php?search=${search}&&limit=${limit}&page=${page}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok');
      }

      //приведем к нужному виду
      const processItem = (item) => ({
        ...item,
        id: item.id || item.ItemId,
        label: item.label || 'Unnamed Item',
        secondaryLabel: item.secondaryLabel || null,
        children: item.children.map(processItem) || []
      });
      return data.map(processItem);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//загрузка элементов списка (вложенные элементы; загрузка только новых элементов)
export const fetchItemDetails = createAsyncThunk(
  'drawingsAllTree/fetchItemDetails',
  async (payload, { getState, rejectWithValue }) => {
    try {
      /*const state = getState();
      const search = selectSearch(state);*/
      //
      const response = await fetch(`http://localhost/Ivc/Ogt/ExecuteScripts/GetDataTreeItem.v0.php`, {
        method: 'POST',
        /*headers: { 'Content-Type': 'application/json' },*/
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Ошибка запроса');      
      return { payload, children: data.items, parentId: data.parentId, childId: data.childId, subChildId: data.subChildId };
    } catch(error) {

    }
  }
);

const drawingsAllTreeSlice = createSlice({
  name: 'drawingsAllTree',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
   }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        const newItems = action.payload.filter(newItem => 
          !state.items.some(existingItem => existingItem.id === newItem.id)
        );
        //
        state.items = [...state.items, ...newItems];//добавляем только новые данные к существующему списку        
        if (newItems.length < state.limit) {
          state.hasMore = false;//если меньше лимита, прекращаем подгрузку
        }
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hasMore = false;
      })
      .addCase(fetchItemDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItemDetails.fulfilled, (state, action) => {
        state.loading = false;
        const { parentId, children } = action.payload;
        const parentItem = state.items.find((item) => item.id === parentId);

        /*if (parentItem) {
          const existingChildIds = new Set(parentItem.children.map((child) => child.id));
          const newChildren = children.filter((child) => !existingChildIds.has(child.id));
        
          parentItem.children = [...parentItem.children, ...newChildren];
        }*/

          

          const removeAllChildren = (items) => items.children[0].children = children;
          
          const addMultipleSubChildren = (items, parentId, newChildren) => {
            return items.map(item => {
              if (item.children) {
                item.children = item.children.map(child => {
                  if (child.id === parentId) {
                    // Добавляем новые subchildren
                    child.children = [...(child.children || []), ...newChildren];
                  } else if (child.children) {
                    // Рекурсивно обходим subchild
                    child.children = addMultipleSubChildren(child.children, parentId, newChildren);
                  }
                  return child;
                });
              }
              return item;
            });
          };
          // Удаление subchild
          removeAllChildren(parentItem);
          
          // Добавление нового subchild
          //state.items = addMultipleSubChildren(state.items, parentId, children);
        
    
        let y;
      })
      .addCase(fetchItemDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setPage } = drawingsAllTreeSlice.actions;
export const selectItems = (state) => state.drawingsAllTreeSlice.items || [];
//export const selectItemDetails = (state, itemId) => state.drawingsAllTree.ItemDetails[itemId] || null;
export default drawingsAllTreeSlice.reducer;