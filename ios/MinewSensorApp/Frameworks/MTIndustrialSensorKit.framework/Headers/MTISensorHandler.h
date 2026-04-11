//
//  MTSensorHandlerV3.h
//  MTSensorV3Kit
//
//  Created by minew on 2021/8/5.
//  Copyright © 2021 Minewtech. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <MTIndustrialSensorKit/MTISensorCommon.h>
#import <MTIndustrialSensorKit/MTIHistoryData.h>
#import <MTIndustrialSensorKit/MTIHTSensorConfigParm.h>
#import <MTIndustrialSensorKit/MTIHTSensorWarmingSettingModel.h>
#import <MTIndustrialSensorKit/MTIAdvertisingParametersData.h>

NS_ASSUME_NONNULL_BEGIN


@class MTIHistoryData, MTIConnectionHandler, MTIHTSensorConfigParm;

@protocol ConnectionDelegateVersion3;

typedef void(^MTReceiceResultOfSensorHandlerCompletion)(BOOL success);
typedef void(^MTReceiceHistoryOfSensorHandlerCompletion)(BOOL success, NSInteger totalNum, NSArray<MTIHistoryData *> *data);
typedef void(^MTReceiceDeviceInfoOfSensorHandlerCompletion)(BOOL success ,MTIHTSensorConfigParm *data);
typedef void(^MTReceiceAdvertisingParmetersOfSensorHandlerCompletion)(BOOL success ,MTIAdvertisingParametersData *data);
typedef void(^MTReceiceHTSensorConfigurationOfSensorHandlerCompletion)(BOOL success ,MTIHTSensorConfigParm *data);
typedef void(^MTReceiceTemperatureUnitOfSensorHandlerCompletion)(BOOL success ,MTITemperatureUnitType unitType);



@interface MTISensorHandler : NSObject


@property (nonatomic,weak) id<ConnectionDelegateVersion3> delegate;


/// Device reset.
/// @param completionHandler  the receive block.
- (void)resetDevice:(MTReceiceResultOfSensorHandlerCompletion)completionHandler;


/// Read historical temperature and humidity data
/// @param formatter the time format you want
/// @param unit temperature unit
/// @param startTimeInterval the start timestamp
/// @param endTimeInterval the end timestamp
/// @param systemTimeInterval the real-time timestamp
/// @param htModel For the device type, only MST01 can be selected for the current version
/// @param completionHandler the receive block
- (void)readHTHistoryWithDateFormatter:(NSDateFormatter *)formatter Unit:(MTITemperatureUnitType)unit StartTimeInterval:(NSTimeInterval)startTimeInterval EndTimeInterval:(NSTimeInterval)endTimeInterval SystemTimeInterval:(NSTimeInterval)systemTimeInterval DeviceHTModelType:(MTIHTModel)htModel completionHandler:(MTReceiceHistoryOfSensorHandlerCompletion)completionHandler;


/// Device setting temperature unit.
/// @param temperatureUnitType  the device temperature unit type of temperature.
/// @param completionHandler the receive block.
- (void)setTemperatureUnit:(MTITemperatureUnitType)temperatureUnitType  completionHandler:(MTReceiceResultOfSensorHandlerCompletion)completionHandler;



/// Power off
/// @param completionHandler the receive block.
- (void)powerOffWithCompletionHandle:(MTReceiceResultOfSensorHandlerCompletion)completionHandler;


/// Device getting temperature unit.
/// @param completionHandler the receive block.
- (void)getTemperatureUnit:(MTReceiceTemperatureUnitOfSensorHandlerCompletion)completionHandler;


/// Set device information frame broadcast parameters
/// @param advertisingInterval Broadcast interval in milliseconds
/// @param txPower -40 -20 -16 -12 -8 -4 0 4dBm
/// @param completionHandler the receive block.
- (void) setDeviceInfoFrameAdvertisingParametersConfiguration:(int) advertisingInterval TxPower:(int)txPower CompletionHandle:(MTReceiceResultOfSensorHandlerCompletion)completionHandler;


/// Set industrial temperature and humidity frame broadcast parameters
/// @param advertisingInterval Broadcast interval in milliseconds
/// @param txPower -40 -20 -16 -12 -8 -4 0 4dBm
/// @param deviceName device name
/// @param completionHandler the receive block.
- (void) setIndustryHTFrameAdvertisingParametersConfiguration:(NSInteger)advertisingInterval TxPower:(int)txPower DeveceName:(NSString *)deviceName CompletionHandle:(MTReceiceResultOfSensorHandlerCompletion)completionHandler;


/// Get the device information frame broadcast parameters
/// @param completionHandler the receive block.
- (void) getDeviceInfoFrameAdvertisingParameters:(MTReceiceAdvertisingParmetersOfSensorHandlerCompletion)completionHandler;


/// Get the industrial temperature and humidity frame broadcast parameters
/// @param completionHandler the receive block.
- (void) getIndustryHTFrameAdvertisingParameters:(MTReceiceAdvertisingParmetersOfSensorHandlerCompletion)completionHandler;


/// Set the industrial humidity and temperature sensor configuration
/// @param htSettingDatas Trigger threshold list fixed length 2
/// @param samplingInterval The sampling interval is in milliseconds
/// @param completionHandler the receive block.
- (void)setIndustryHTSensorConfiguration: (NSArray<MTIHTSensorWarmingSettingModel *> *)htSettingDatas SamplingInterval:(int)samplingInterval CompletionHandle:(MTReceiceResultOfSensorHandlerCompletion)completionHandler;


/// Get industrial humidity and temperature sensor configurations
/// @param completionHandler the receive block.
- (void)getIndustryHTSensorConfiguration:(MTReceiceHTSensorConfigurationOfSensorHandlerCompletion)completionHandler;


@end

NS_ASSUME_NONNULL_END
