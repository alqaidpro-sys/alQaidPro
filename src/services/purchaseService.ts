import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, updateDoc, doc, increment, serverTimestamp, getDoc } from "firebase/firestore";

export interface PurchaseDetails {
  serviceId: string;
  serviceName: string;
  icon: string;
  color: string;
  amount: number;
  details: any;
  type?: string;
}

export async function processPurchase({ serviceId, serviceName, icon, color, amount, details, type = "PURCHASE" }: PurchaseDetails) {
  if (!auth.currentUser) throw new Error("يجب تسجيل الدخول أولاً");

  try {
    // 0. Check balance first
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const currentBalance = userSnap.data()?.balance || 0;
    if (currentBalance < amount) {
      throw new Error(`عذراً، رصيدك الحالي (£${currentBalance}) لا يكفي لإتمام الطلب (£${amount})`);
    }

    // 1. Create order record
    const orderRef = await addDoc(collection(db, "orders"), {
      name: serviceName,
      amount: `£${amount.toLocaleString()}`,
      amountValue: amount,
      icon,
      color,
      type,
      status: "processing", 
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      date: new Date().toLocaleDateString("ar-EG") + " " + new Date().toLocaleTimeString("ar-EG"),
      createdAt: serverTimestamp(),
      details
    });

    // 2. Update user balance
    await updateDoc(userRef, {
      balance: increment(-amount),
      updatedAt: serverTimestamp()
    });

    return { success: true, orderId: orderRef.id };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "orders/users");
    throw error;
  }
}

export async function processCartCheckout(items: any[], total: number) {
  if (!auth.currentUser) throw new Error("يجب تسجيل الدخول أولاً");

  try {
    // 0. Check balance first
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const currentBalance = userSnap.data()?.balance || 0;
    if (currentBalance < total) {
      throw new Error(`عذراً، رصيدك (£${currentBalance}) لا يكفي لإتمام الطلبات (£${total})`);
    }

    // 1. Create orders for each item
    const results = await Promise.all(items.map(item => {
      const price = (item.price || item.total || 0);
      return addDoc(collection(db, "orders"), {
        name: item.service?.name || item.name || "طلب من السلة",
        amount: `£${price.toLocaleString()}`,
        amountValue: price,
        icon: item.service?.icon || item.icon || "📦",
        color: item.service?.color || item.color || "#3b82f6",
        type: "CART_ITEM",
        status: "processing",
        userId: auth.currentUser!.uid,
        userEmail: auth.currentUser!.email,
        date: new Date().toLocaleDateString("ar-EG") + " " + new Date().toLocaleTimeString("ar-EG"),
        createdAt: serverTimestamp(),
        details: item.vals || item.fields || {}
      });
    }));

    // 2. Update user balance once
    await updateDoc(userRef, {
      balance: increment(-total),
      updatedAt: serverTimestamp()
    });

    return { success: true, orderIds: results.map(r => r.id) };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "cart/checkout");
    throw error;
  }
}
