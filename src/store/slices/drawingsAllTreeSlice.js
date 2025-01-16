import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
//import { selectSearch } from './headerSlice';
import { selectDrawingExternalCode } from './drawingsSlice';

const LIMIT_DEFAULT = 50;
const PAGE_DEFAULT = 1;
const LOADING_DEFAULT = false;
const HASMORE_DEFAULT = true;

const initialState = {
  items: [],
  itemsDetails: [],
  loading: LOADING_DEFAULT,
  error: null,
  limit: LIMIT_DEFAULT,
  page: PAGE_DEFAULT,
  hasMore: HASMORE_DEFAULT,
  eventType: ''
};

//загрузка списка изделий (корневые элементы)
export const fetchData = createAsyncThunk(
  'drawingsAllTree/fetchData',
  async ({ limit, page, eventType }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const externalCode = selectDrawingExternalCode(state);//const search = selectSearch(state);
      //
      const response = await fetch(`http://localhost/Ivc/Ogt/ExecuteScripts/CreateDataTree.v0.php?search=${externalCode}&&limit=${limit}&page=${page}`);
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
      return { payload, children: data.items, parentId: data.parentId };
    } catch(error) {

    }
  }
);

const drawingsAllTreeSlice = createSlice({
  name: 'drawingsAllTree',
  initialState,
  reducers: {
    setItems: (state) => {
      state.items = [];
      state.page = PAGE_DEFAULT;
      state.limit = LIMIT_DEFAULT;
      state.loading = LOADING_DEFAULT;
      state.hasMore = HASMORE_DEFAULT;
    },
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
        state.eventType = '';//?
      })
      .addCase(fetchItemDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItemDetails.fulfilled, (state, action) => {
        state.loading = false;
        const { parentId, children, payload } = action.payload;
        const parentItem = state.items.find((item) => item.id === parentId);

                        
        const findByIdRecursive = (array, id) => {
          for (const item of array) {
            if (item.id === id) {
              return item; // Если нашли совпадение, возвращаем элемент
            }
            if (item.children && item.children.length > 0) {
              const found = findByIdRecursive(item.children, id); // Рекурсивно ищем в children
              if (found) {
                return found; // Если нашли в дочерних, возвращаем найденный элемент
              }
            }
          }
          return null; // Если не найдено, возвращаем null
        }

        //id родительского элемента
        if (payload.options.product_info.type == 'product') {
          parentItem.children[0].children = children;
        } else if (payload.options.product_info.type == 'node') {
          const item = findByIdRecursive(parentItem.children, payload.child.id);
          item.children = children;
        }
      })
      .addCase(fetchItemDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setItems, setPage } = drawingsAllTreeSlice.actions;
export const selectItems = (state) => state.drawingsAllTreeSlice.items || [];
//export const selectItemDetails = (state, itemId) => state.drawingsAllTree.ItemDetails[itemId] || null;
export default drawingsAllTreeSlice.reducer;