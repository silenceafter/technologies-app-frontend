import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
  hasMore: true,
  limit: 10,
  page: 1,
  search: '',
};

export const fetchData = createAsyncThunk(
  'products/fetchData',
  async (payload, { rejectWithValue }) => {
    try {
      const externalCode = payload.drawing.externalcode;
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      //
      const response = await fetch(`${baseUrl}/Ivc/Ogt/ExecuteScripts/GetProducts.v0.php`, {
        method: 'POST',
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok');
      }

      //для пустого значения
      if (!externalCode.trim()) return rejectWithValue('Пустое значение поиска');

      //приведем к нужному виду
      const processItem = (item) => ({
        ...item,
        id: item.id || item.ItemId,
        label: item.label || 'Unnamed Item', /* код операции */
        secondaryLabel: item.secondaryLabel || null, /* наименование операции */
        children: item.children.map(processItem) || [],
        type: item.type,
      });
      return data.map(processItem);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//загрузка элементов списка (вложенные элементы; загрузка только новых элементов)
export const fetchItemDetails = createAsyncThunk(
  'products/fetchItemDetails',
  async (payload) => {
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseUrl}/Ivc/Ogt/ExecuteScripts/GetProductsDataTreeItem.v0.php`, { /* http://localhost/Ivc/Ogt/ExecuteScripts/GetProductsDataTreeItem.v0.php */
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Ошибка запроса');
      return { payload, children: data.items, parentId: data.parentId };
    } catch(error) {

    }
  }
);

//сохранить введенные данные
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      state.page = 1;
      state.items = [];
      state.hasMore = true;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;      
    },
    setPage: (state, action) => {
       state.page = action.payload;
    },
    resetProducts: () => initialState,
  },
  extraReducers: (builder) => {
    //fetchData
    builder.addCase(fetchData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.loading = false;
      const newItems = action.payload.filter(newItem => 
        !state.items.some(existingItem => existingItem.id === newItem.id)
      );
      //
      state.items = [...state.items, ...newItems];//добавляем только новые данные к существующему списку
      if (newItems.length < state.limit) {
        state.hasMore = false;//если меньше лимита, прекращаем подгрузку
      }
    });
    builder.addCase(fetchData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.hasMore = false;
    });

    //fetchItemDetails
    builder.addCase(fetchItemDetails.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchItemDetails.fulfilled, (state, action) => {
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
    });
    builder.addCase(fetchItemDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { setSearch, setLimit, setPage, resetProducts } = productsSlice.actions;
export default productsSlice.reducer;