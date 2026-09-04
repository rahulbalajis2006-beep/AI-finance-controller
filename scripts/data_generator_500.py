import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

# Configuration
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

TOTAL_TXNS = 500
DISTRIBUTION = {
    'exact': 325,
    'timing_difference': 60,
    'amount_mismatch': 40,
    'missing_settlement': 25,
    'missing_payment': 15,
    'duplicate': 15,
    'refund': 20
}

START_DATE = datetime(2026, 8, 1)
MERCHANTS = [f"MERCHANT_{str(i).zfill(3)}" for i in range(1, 11)]
PAYMENT_METHODS = ['UPI', 'Card', 'NetBanking', 'Wallet']
MDR_RATE = 0.02
GST_RATE = 0.18

invoices = []
payments = []
settlements = []
bank_credits = []

# Flatten categories based on distribution
categories = []
for cat, count in DISTRIBUTION.items():
    categories.extend([cat] * count)
random.shuffle(categories)

for i, category in enumerate(categories):
    # Base Data
    txn_id = i + 1
    base_amount = round(random.uniform(5000, 100000), 2)
    merchant = random.choice(MERCHANTS)
    method = random.choice(PAYMENT_METHODS)
    
    # Base Dates
    inv_date = START_DATE + timedelta(days=random.randint(0, 25))
    pay_date = inv_date + timedelta(minutes=random.randint(5, 60))
    set_date = inv_date + timedelta(days=1)
    bank_date = set_date
    
    # Identifiers
    inv_id = f"INV_{txn_id:05d}"
    pay_id = f"PAY_{txn_id:05d}"
    set_id = f"SET_{txn_id:05d}"
    utr = f"UTR_ICICI_{txn_id:08d}"
    
    # Ground Truth defaults
    should_match = True
    confidence = 1.0
    
    if category == 'exact':
        pass
    elif category == 'timing_difference':
        set_date = inv_date + timedelta(days=random.randint(3, 7))
        bank_date = set_date
        confidence = 0.90
    elif category == 'amount_mismatch':
        should_match = False
        confidence = 0.85
    elif category == 'missing_settlement':
        should_match = False
        confidence = 0.0
    elif category == 'missing_payment':
        should_match = False
        confidence = 0.0
    elif category == 'duplicate':
        should_match = False
        confidence = 0.95
    elif category == 'refund':
        should_match = False
        confidence = 1.0

    # Calculations
    mdr_fee = round(base_amount * MDR_RATE, 2)
    gst_fee = round(mdr_fee * GST_RATE, 2)
    net_expected = round(base_amount - mdr_fee - gst_fee, 2)
    
    # 1. Generate Invoices
    invoices.append({
        'invoice_id': inv_id,
        'date': inv_date.strftime('%Y-%m-%dT%H:%M:%SZ'),
        'amount': base_amount,
        'merchant_id': merchant,
        'should_match': should_match,
        'exception_type': category if category != 'exact' else 'none',
        'expected_match_confidence': confidence
    })
    
    if category == 'duplicate':
        # Add a second identical invoice to simulate a duplication bug
        invoices.append({
            'invoice_id': inv_id + "_DUP",
            'date': (inv_date + timedelta(seconds=10)).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'amount': base_amount,
            'merchant_id': merchant,
            'should_match': False,
            'exception_type': 'duplicate',
            'expected_match_confidence': 0.95
        })
        
    # 2. Generate Payments
    # Skip creating a payment record for 'missing_payment' (Yields 485 records)
    if category != 'missing_payment':
        payments.append({
            'payment_id': pay_id,
            'invoice_id': inv_id,
            'amount': base_amount,
            'method': method,
            'date': pay_date.strftime('%Y-%m-%dT%H:%M:%SZ')
        })
        
    # 3. Generate Settlements & Bank Credits
    # Skip creating a settlement for 'missing_settlement' (Yields 475 records)
    # Note: 'missing_payment' STILL creates a settlement here, simulating an orphan settlement 
    # where the payment API failed but the gateway still processed the money!
    if category != 'missing_settlement':
        actual_net = net_expected
        actual_gross = base_amount

        if category == 'amount_mismatch':
            # Simulate a gateway taking an unexpected extra fee
            actual_net = round(net_expected - random.uniform(50, 500), 2)
        elif category == 'refund':
            # Simulate a chargeback / refund
            actual_net = -net_expected
            actual_gross = -base_amount
            
        settlements.append({
            'settlement_id': set_id,
            'payment_id': pay_id,
            'gross_amount': actual_gross,
            'mdr_fee': mdr_fee,
            'gst_fee': gst_fee,
            'net_amount': actual_net,
            'date': set_date.strftime('%Y-%m-%dT%H:%M:%SZ')
        })
        
        bank_credits.append({
            'utr_number': utr,
            'settlement_id': set_id,
            'amount': actual_net,
            'date': bank_date.strftime('%Y-%m-%dT%H:%M:%SZ')
        })

# Convert to DataFrames
df_inv = pd.DataFrame(invoices)
df_pay = pd.DataFrame(payments)
df_set = pd.DataFrame(settlements)
df_bank = pd.DataFrame(bank_credits)

# Save to data/ directory
os.makedirs('data', exist_ok=True)
df_inv.to_csv('data/invoices.csv', index=False)
df_pay.to_csv('data/payments.csv', index=False)
df_set.to_csv('data/settlements.csv', index=False)
df_bank.to_csv('data/bank_credits.csv', index=False)

print("============ SYNTHETIC DATA GENERATION COMPLETE ============")
print(f"Total Logic Transactions: {TOTAL_TXNS}")
print(f"Generated Invoices.csv:    {len(df_inv)} rows (Includes {DISTRIBUTION['duplicate']} duplicates)")
print(f"Generated Payments.csv:    {len(df_pay)} rows ({DISTRIBUTION['missing_payment']} missing payments)")
print(f"Generated Settlements.csv: {len(df_set)} rows ({DISTRIBUTION['missing_settlement']} missing settlements)")
print(f"Generated Bank Credits:    {len(df_bank)} rows")
print("============================================================")
print("\nDistribution Ground Truth (from Invoices):")
print(df_inv['exception_type'].value_counts())
