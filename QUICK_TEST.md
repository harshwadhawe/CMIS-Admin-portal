# Quick API Testing Guide

## 🚀 Fastest Way: Use the Frontend

1. **Start server**: `npm run dev`
2. **Open browser**: `http://localhost:3000`
3. **Login**: username `admin`, password `admin123`
4. **Go to Events page** and test creating/viewing events
5. **Open DevTools (F12) → Network tab** to see all API calls

---

## ⚡ Quick cURL Test

### 1. Login and get token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**Copy the token from the response!**

### 2. Test Get Events (replace YOUR_TOKEN):
```bash
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Create Event:
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test Event\",\"description\":\"Test description\"}"
```

---

## 🧪 Run Automated Test Script

```bash
npm run test:api
```

Or directly:
```bash
node test-apis.js
```

This will test all APIs automatically!

---

## 📋 All Available Methods

See `TESTING_APIS.md` for complete testing guide with:
- ✅ Browser DevTools method
- ✅ cURL commands
- ✅ Postman/Thunder Client setup
- ✅ Test script details
- ✅ Troubleshooting tips

---

## ✅ Quick Checklist

- [ ] Server running? (`npm run dev`)
- [ ] Can login? (get token)
- [ ] Can get events? (with token)
- [ ] Can create event? (with token)
- [ ] Unauthorized requests fail? (401 error)

---

**Need more details?** Check `TESTING_APIS.md` for comprehensive guide!

