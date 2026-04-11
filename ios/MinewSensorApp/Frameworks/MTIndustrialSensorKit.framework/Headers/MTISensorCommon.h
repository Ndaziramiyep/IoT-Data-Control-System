//
//  MTSensorV3Common.h
//  MTSensorV3Kit
//
//  Created by minew on 2021/8/31.
//  Copyright © 2021 Minewtech. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN


typedef NS_ENUM(NSUInteger, MTITemperatureUnitType) {
    MTICelsius = 0, // ℃
    MTIFahrenheit, // ℉
};

typedef NS_ENUM(NSUInteger, MTIDeviceType) {
    HT = 0,
    SingleTemp,
};

typedef NS_ENUM(NSInteger, MTIFrameType) {
    MTIFrameNone = -3,
    MTIFrameConnectable = -2,
    MTIFrameUnknown = -1,
    MTIFrameDeviceInfo = 0,
    MTIFrameHTSensor,
};

typedef NS_ENUM(NSUInteger, MTIHTModel) {
    PR2122 = 0,
    MST01,
};

typedef NS_ENUM(NSUInteger, MTIWarningType) {
    Normal = 0,
    AbNormal,
};

@interface MTISensorCommon : NSObject

@end

NS_ASSUME_NONNULL_END
