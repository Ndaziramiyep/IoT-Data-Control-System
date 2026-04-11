#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>
#import <objc/message.h>

static id MinewSafeValue(id object, NSString *key) {
  if (!object || key.length == 0) {
    return nil;
  }
  @try {
    return [object valueForKey:key];
  } @catch (__unused NSException *exception) {
    return nil;
  }
}

static NSString *MinewStringFromValue(id value) {
  if ([value isKindOfClass:NSString.class]) {
    return value;
  }
  if ([value respondsToSelector:@selector(stringValue)]) {
    return [value stringValue];
  }
  if (value != nil && value != [NSNull null]) {
    return [value description];
  }
  return nil;
}

static NSNumber *MinewNumberFromValue(id value) {
  if ([value isKindOfClass:NSNumber.class]) {
    return value;
  }
  if ([value isKindOfClass:NSString.class]) {
    NSString *string = [(NSString *)value stringByTrimmingCharactersInSet:NSCharacterSet.whitespaceAndNewlineCharacterSet];
    if (string.length == 0) {
      return nil;
    }
    return @([string doubleValue]);
  }
  return nil;
}

static NSData *MinewDataFromHexString(NSString *hexString) {
  if (![hexString isKindOfClass:NSString.class]) {
    return nil;
  }

  NSMutableString *clean = [[hexString stringByReplacingOccurrencesOfString:@" " withString:@""] mutableCopy];
  clean = [[[clean stringByReplacingOccurrencesOfString:@"<" withString:@""] stringByReplacingOccurrencesOfString:@">" withString:@""] mutableCopy];
  clean = [[[clean stringByReplacingOccurrencesOfString:@":" withString:@""] stringByReplacingOccurrencesOfString:@"-" withString:@""] mutableCopy];
  if (clean.length == 0) {
    return nil;
  }
  if (clean.length % 2 != 0) {
    [clean insertString:@"0" atIndex:0];
  }

  NSMutableData *data = [NSMutableData dataWithCapacity:clean.length / 2];
  for (NSUInteger i = 0; i + 1 < clean.length; i += 2) {
    NSString *byteString = [clean substringWithRange:NSMakeRange(i, 2)];
    unsigned int byte = 0;
    [[NSScanner scannerWithString:byteString] scanHexInt:&byte];
    uint8_t value = (uint8_t)byte;
    [data appendBytes:&value length:1];
  }
  return data;
}

@interface MinewBleModule : RCTEventEmitter <RCTBridgeModule>
@end

@implementation MinewBleModule {
  BOOL _hasListeners;
  NSMutableDictionary<NSString *, id> *_peripheralsByMac;
  NSMutableDictionary<NSString *, NSDictionary *> *_latestBroadcastByMac;
}

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _peripheralsByMac = [NSMutableDictionary dictionary];
    _latestBroadcastByMac = [NSMutableDictionary dictionary];
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
    @"onDevicesUpdated",
    @"onConnectionChange",
    @"onNotifyData",
    @"onServicesDiscovered",
    @"onHistoryDataReceived",
    @"onConfigResult"
  ];
}

- (void)startObserving {
  _hasListeners = YES;
}

- (void)stopObserving {
  _hasListeners = NO;
}

- (void)emitEvent:(NSString *)event body:(id)body {
  if (_hasListeners) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self sendEventWithName:event body:body];
    });
  }
}

- (id)managerInstance {
  Class managerClass = NSClassFromString(@"MTICentralManagerV3");
  if (!managerClass) {
    managerClass = NSClassFromString(@"MTICentralManager");
  }
  if (!managerClass || ![managerClass respondsToSelector:@selector(sharedInstance)]) {
    return nil;
  }
  return ((id (*)(id, SEL))objc_msgSend)(managerClass, @selector(sharedInstance));
}

- (NSArray *)scannedPeripheralsFromManager:(id)manager {
  NSArray *scanned = MinewSafeValue(manager, @"scannedPeris");
  return [scanned isKindOfClass:NSArray.class] ? scanned : @[];
}

- (id)peripheralForMac:(NSString *)mac {
  id cached = _peripheralsByMac[mac];
  if (cached) {
    return cached;
  }

  id manager = [self managerInstance];
  if (!manager) {
    return nil;
  }

  for (id peripheral in [self scannedPeripheralsFromManager:manager]) {
    id identifier = MinewSafeValue(peripheral, @"identifier");
    id broadcast = MinewSafeValue(peripheral, @"broadcast");
    NSString *candidate = MinewStringFromValue(identifier);
    if (candidate.length == 0) {
      candidate = MinewStringFromValue(MinewSafeValue(broadcast, @"mac"));
    }
    if ([candidate isEqualToString:mac]) {
      _peripheralsByMac[mac] = peripheral;
      return peripheral;
    }
  }

  return nil;
}

- (NSDictionary *)devicePayloadFromPeripheral:(id)peripheral {
  id broadcast = MinewSafeValue(peripheral, @"broadcast");
  id frameHandler = MinewSafeValue(peripheral, @"frameHandler");
  id frame = MinewSafeValue(frameHandler, @"advFrames");
  if ([frame isKindOfClass:NSArray.class] && [(NSArray *)frame count] > 0) {
    broadcast = [(NSArray *)frame firstObject];
  }

  NSString *identifier = MinewStringFromValue(MinewSafeValue(peripheral, @"identifier"));
  NSString *mac = MinewStringFromValue(MinewSafeValue(broadcast, @"mac")) ?: identifier;
  NSString *name = MinewStringFromValue(MinewSafeValue(broadcast, @"name")) ?: mac ?: @"Unknown";
  NSNumber *battery = MinewNumberFromValue(MinewSafeValue(broadcast, @"battery"));
  NSNumber *temperature = MinewNumberFromValue(MinewSafeValue(broadcast, @"temp"));
  if (!temperature) {
    temperature = MinewNumberFromValue(MinewSafeValue(broadcast, @"temperature"));
  }
  NSNumber *humidity = MinewNumberFromValue(MinewSafeValue(broadcast, @"humi"));
  if (!humidity) {
    humidity = MinewNumberFromValue(MinewSafeValue(broadcast, @"humidity"));
  }
  NSString *firmVersion = MinewStringFromValue(MinewSafeValue(broadcast, @"firmVersion"));
  if (!firmVersion) {
    firmVersion = MinewStringFromValue(MinewSafeValue(broadcast, @"firmwareVersion"));
  }

  NSMutableDictionary *payload = [NSMutableDictionary dictionary];
  if (mac.length > 0) payload[@"mac"] = mac;
  if (identifier.length > 0) payload[@"identifier"] = identifier;
  payload[@"name"] = name;
  if (temperature) payload[@"temperature"] = temperature;
  if (humidity) payload[@"humidity"] = humidity;
  if (battery) payload[@"battery"] = battery;
  if (firmVersion.length > 0) payload[@"firmVersion"] = firmVersion;
  return payload;
}

- (void)refreshDeviceCacheWithPeripherals:(NSArray *)peripherals {
  NSMutableArray *payload = [NSMutableArray array];
  for (id peripheral in peripherals) {
    NSDictionary *devicePayload = [self devicePayloadFromPeripheral:peripheral];
    NSString *mac = devicePayload[@"mac"];
    if (mac.length > 0) {
      _peripheralsByMac[mac] = peripheral;
      _latestBroadcastByMac[mac] = devicePayload;
    }
    [payload addObject:devicePayload];
  }
  [self emitEvent:@"onDevicesUpdated" body:payload];
}

- (void)emitConnectedStateForMac:(NSString *)mac {
  [self emitEvent:@"onConnectionChange" body:@{@"mac": mac ?: @"", @"state": @"connected"}];

  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.8 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
    [self emitEvent:@"onConnectionChange" body:@{@"mac": mac ?: @"", @"state": @"connected_complete"}];
    [self emitEvent:@"onServicesDiscovered" body:@{@"mac": mac ?: @""}];
  });
}

RCT_EXPORT_METHOD(startScan)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    id manager = [self managerInstance];
    if (!manager) {
      return;
    }

    SEL statusSelector = NSSelectorFromString(@"didChangesBluetoothStatus:");
    if ([manager respondsToSelector:statusSelector]) {
      void (^statusBlock)(NSInteger) = ^(NSInteger status) {
        if (status == 0) {
          [self emitEvent:@"onConnectionChange" body:@{@"mac": @"", @"state": @"disconnected"}];
        }
      };
      ((void (*)(id, SEL, id))objc_msgSend)(manager, statusSelector, statusBlock);
    }

    SEL scanSelector = NSSelectorFromString(@"startScan:");
    if (![manager respondsToSelector:scanSelector]) {
      return;
    }

    void (^scanBlock)(NSArray *) = ^(NSArray *devices) {
      [self refreshDeviceCacheWithPeripherals:devices ?: @[]];
    };
    ((void (*)(id, SEL, id))objc_msgSend)(manager, scanSelector, scanBlock);
  });
}

RCT_EXPORT_METHOD(stopScan)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    id manager = [self managerInstance];
    if (!manager) {
      return;
    }
    SEL stopSelector = NSSelectorFromString(@"stopScan:");
    if ([manager respondsToSelector:stopSelector]) {
      ((void (*)(id, SEL, id))objc_msgSend)(manager, stopSelector, nil);
    }
  });
}

RCT_EXPORT_METHOD(connectToDevice:(NSString *)mac key:(NSString *)key)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    id manager = [self managerInstance];
    id peripheral = [self peripheralForMac:mac];
    if (!manager || !peripheral) {
      [self emitEvent:@"onConnectionChange" body:@{@"mac": mac ?: @"", @"state": @"disconnected"}];
      return;
    }

    NSString *secretKey = (key.length > 0) ? key : @"minewtech1234567";
    [self emitEvent:@"onConnectionChange" body:@{@"mac": mac ?: @"", @"state": @"connecting"}];

    SEL connectSelector = NSSelectorFromString(@"connectToPeriperal:SecretKey:");
    if ([manager respondsToSelector:connectSelector]) {
      ((void (*)(id, SEL, id, id))objc_msgSend)(manager, connectSelector, peripheral, secretKey);
    } else {
      SEL fallbackSelector = NSSelectorFromString(@"connectToPeriperal:");
      if ([manager respondsToSelector:fallbackSelector]) {
        ((void (*)(id, SEL, id))objc_msgSend)(manager, fallbackSelector, peripheral);
      }
    }

    id connector = MinewSafeValue(peripheral, @"connector");
    SEL connectionSelector = NSSelectorFromString(@"didChangeConnection:");
    if ([connector respondsToSelector:connectionSelector]) {
      __weak typeof(self) weakSelf = self;
      void (^connectionBlock)(NSInteger) = ^(NSInteger state) {
        __strong typeof(weakSelf) strongSelf = weakSelf;
        if (!strongSelf) {
          return;
        }

        if (state == 0) {
          [strongSelf emitEvent:@"onConnectionChange" body:@{@"mac": mac ?: @"", @"state": @"disconnected"}];
          return;
        }

        [strongSelf emitConnectedStateForMac:mac];
      };
      ((void (*)(id, SEL, id))objc_msgSend)(connector, connectionSelector, connectionBlock);
    } else {
      [self emitConnectedStateForMac:mac];
    }
  });
}

RCT_EXPORT_METHOD(disconnectDevice:(NSString *)mac)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    id manager = [self managerInstance];
    if (!manager) {
      return;
    }

    SEL disconnectSelector = NSSelectorFromString(@"disconnectFromPeriperal:");
    if ([manager respondsToSelector:disconnectSelector]) {
      id peripheral = [self peripheralForMac:mac];
      ((void (*)(id, SEL, id))objc_msgSend)(manager, disconnectSelector, peripheral);
    } else {
      SEL legacySelector = NSSelectorFromString(@"disConnect:");
      if ([manager respondsToSelector:legacySelector]) {
        ((void (*)(id, SEL, id))objc_msgSend)(manager, legacySelector, mac);
      }
    }

    [self emitEvent:@"onConnectionChange" body:@{@"mac": mac ?: @"", @"state": @"disconnected"}];
  });
}

- (NSArray *)historyPayloadFromDataArray:(NSArray *)dataArray fallbackBattery:(NSNumber *)battery {
  NSMutableArray *history = [NSMutableArray array];
  for (id item in dataArray) {
    NSNumber *temperature = MinewNumberFromValue(MinewSafeValue(item, @"temp"));
    if (!temperature) {
      temperature = MinewNumberFromValue(MinewSafeValue(item, @"temperature"));
    }
    NSNumber *humidity = MinewNumberFromValue(MinewSafeValue(item, @"humi"));
    if (!humidity) {
      humidity = MinewNumberFromValue(MinewSafeValue(item, @"humidity"));
    }
    NSString *timestamp = MinewStringFromValue(MinewSafeValue(item, @"timeStr"));
    if (!timestamp) {
      timestamp = MinewStringFromValue(MinewSafeValue(item, @"timestamp"));
    }
    NSNumber *itemBattery = MinewNumberFromValue(MinewSafeValue(item, @"battery"));
    if (!itemBattery) {
      itemBattery = battery;
    }

    NSMutableDictionary *record = [NSMutableDictionary dictionary];
    record[@"temperature"] = temperature ?: @0;
    record[@"humidity"] = humidity ?: @0;
    record[@"timestamp"] = timestamp ?: @"";
    if (itemBattery) {
      record[@"battery"] = itemBattery;
    }
    [history addObject:record];
  }
  return history;
}

RCT_EXPORT_METHOD(readHistoryData:(NSString *)mac)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    id peripheral = [self peripheralForMac:mac];
    if (!peripheral) {
      [self emitEvent:@"onHistoryDataReceived" body:@{@"mac": mac ?: @"", @"history": @[]}];
      return;
    }

    id connector = MinewSafeValue(peripheral, @"connector");
    id sensorHandler = MinewSafeValue(connector, @"sensorHandler");
    if (!sensorHandler) {
      [self emitEvent:@"onHistoryDataReceived" body:@{@"mac": mac ?: @"", @"history": @[]}];
      return;
    }

    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    [formatter setDateFormat:@"yyyy/MM/dd HH:mm:ss"];
    formatter.timeZone = [NSTimeZone timeZoneWithAbbreviation:@"UTC"];

    NSTimeInterval endTime = [[NSDate date] timeIntervalSince1970];
    NSTimeInterval startTime = endTime - (7 * 24 * 60 * 60);
    NSNumber *deviceType = @4;
    NSNumber *unit = @0;
    NSNumber *systemTime = @(endTime);

    SEL historySelector = NSSelectorFromString(@"readOnlyTemHistoryWithDateFormatter:Unit:StartTimeInterval:EndTimeInterval:SystemTimeInterval:DeviceHTModelType:completionHandler:");
    if ([sensorHandler respondsToSelector:historySelector]) {
      __weak typeof(self) weakSelf = self;
      void (^completionBlock)(BOOL, NSInteger, NSArray *) = ^(BOOL success, NSInteger totalNum, NSArray *dataArray) {
        __strong typeof(weakSelf) strongSelf = weakSelf;
        if (!strongSelf) {
          return;
        }

        NSArray *fallback = [strongSelf historyPayloadFromDataArray:dataArray ?: @[] fallbackBattery:MinewNumberFromValue(MinewSafeValue(MinewSafeValue(peripheral, @"broadcast"), @"battery"))];
        [strongSelf emitEvent:@"onHistoryDataReceived" body:@{@"mac": mac ?: @"", @"history": fallback}];
      };
      ((void (*)(id, SEL, id, id, double, double, double, id, id))objc_msgSend)(sensorHandler, historySelector, formatter, unit, startTime, endTime, systemTime, deviceType, completionBlock);
      return;
    }

    [self emitEvent:@"onHistoryDataReceived" body:@{@"mac": mac ?: @"", @"history": @[]}];
  });
}

RCT_EXPORT_METHOD(setTemperatureUnit:(NSString *)mac isCelsius:(BOOL)isCelsius)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    id peripheral = [self peripheralForMac:mac];
    id sensorHandler = MinewSafeValue(MinewSafeValue(peripheral, @"connector"), @"sensorHandler");
    SEL selector = NSSelectorFromString(@"setTemperatureUnit:completionHandler:");
    if (![sensorHandler respondsToSelector:selector]) {
      [self emitEvent:@"onConfigResult" body:@{@"mac": mac ?: @"", @"success": @NO, @"type": @"unit"}];
      return;
    }

    NSInteger unit = isCelsius ? 0 : 1;
    __weak typeof(self) weakSelf = self;
    void (^completionBlock)(BOOL) = ^(BOOL success) {
      __strong typeof(weakSelf) strongSelf = weakSelf;
      if (!strongSelf) {
        return;
      }
      [strongSelf emitEvent:@"onConfigResult" body:@{@"mac": mac ?: @"", @"success": @(success), @"type": @"unit"}];
    };
    ((void (*)(id, SEL, NSInteger, id))objc_msgSend)(sensorHandler, selector, unit, completionBlock);
  });
}

RCT_EXPORT_METHOD(setOpenHistoryDataStore:(NSString *)mac isOpen:(BOOL)isOpen resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    id peripheral = [self peripheralForMac:mac];
    id sensorHandler = MinewSafeValue(MinewSafeValue(peripheral, @"connector"), @"sensorHandler");
    NSArray<NSString *> *selectors = @[
      @"setOpenHistoryDataStore:completionHandler:",
      @"setHistoryStorage:completionHandler:",
      @"setOpenStorageSwitch:completionHandler:"
    ];

    __block BOOL invoked = NO;
    __weak typeof(self) weakSelf = self;
    void (^completionBlock)(BOOL) = ^(BOOL success) {
      __strong typeof(weakSelf) strongSelf = weakSelf;
      if (!strongSelf) {
        return;
      }
      [strongSelf emitEvent:@"onConfigResult" body:@{@"mac": mac ?: @"", @"success": @(success), @"type": @"storage"}];
      resolve(@(success));
    };

    for (NSString *selectorName in selectors) {
      SEL selector = NSSelectorFromString(selectorName);
      if ([sensorHandler respondsToSelector:selector]) {
        invoked = YES;
        ((void (*)(id, SEL, BOOL, id))objc_msgSend)(sensorHandler, selector, isOpen, completionBlock);
        break;
      }
    }

    if (!invoked) {
      [self emitEvent:@"onConfigResult" body:@{@"mac": mac ?: @"", @"success": @NO, @"type": @"storage"}];
      resolve(@(NO));
    }
  });
}

RCT_EXPORT_METHOD(sendCommand:(NSString *)mac service:(NSString *)service characteristic:(NSString *)characteristic data:(NSString *)hexData)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    id peripheral = [self peripheralForMac:mac];
    id connector = MinewSafeValue(peripheral, @"connector");
    NSData *data = MinewDataFromHexString(hexData);
    SEL selector = NSSelectorFromString(@"writeData:completion:");
    if ([connector respondsToSelector:selector] && data) {
      void (^completionBlock)(BOOL, NSError *) = ^(BOOL success, NSError *error) {
        if (error) {
          RCTLogWarn(@"Minew iOS writeData failed for %@: %@", mac, error);
        }
      };
      ((void (*)(id, SEL, id, id))objc_msgSend)(connector, selector, data, completionBlock);
    }
  });
}

@end
